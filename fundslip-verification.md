# Fundslip — Verification Architecture Implementation

## CONTEXT

The app UI is built. Now implement the core cryptographic verification system. This is the most critical code in the entire app. It must be mathematically correct. No shortcuts.

**Principle: Pure On-Chain Truth.** No databases. No IPFS. No file storage. No server state. Everything is derived from the public Ethereum blockchain and verified via cryptographic signatures. If Fundslip's servers disappeared tomorrow, anyone with the compact payload could still verify a statement using any Ethereum node.

---

## THE VERIFICATION MODEL

### Generation Flow (when user clicks "Generate Statement")

**Step 1: Pin the block**
```typescript
const provider = new ethers.JsonRpcProvider(RPC_URL)
const currentBlock = await provider.getBlockNumber()
```
All balance queries MUST use this pinned block number. Never use "latest" — by the time someone verifies, "latest" will be a different block.

**Step 2: Fetch on-chain data at the pinned block**
```typescript
// ETH balance at pinned block
const ethBalance = await provider.getBalance(walletAddress, currentBlock)

// ERC-20 balances at pinned block (for each token the wallet holds)
const tokenBalances = await Promise.all(
  tokenList.map(async (token) => {
    const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
    const balance = await contract.balanceOf(walletAddress, { blockTag: currentBlock })
    return { address: token.address, balance: balance.toString() }
  })
)

// Transaction history for the period (via Etherscan API)
// Collect the tx hashes — these are on-chain primitives
const transactions = await fetchTransactionHistory(walletAddress, periodStart, periodEnd)
const txHashes = transactions.map(tx => tx.hash).sort() // sort for determinism
```

**Step 3: Deterministic serialization**

THIS IS THE MOST CRITICAL FUNCTION IN THE ENTIRE APP. Generation and verification MUST produce identical bytes for identical data. Use ABI encoding, NOT JSON.

```typescript
import { ethers } from 'ethers'

function serializeStatementData(
  wallet: string,
  chainId: number,
  blockNumber: number,
  periodStart: number,
  periodEnd: number,
  ethBalance: bigint,
  tokenBalances: Array<{ address: string; balance: string }>,
  txHashes: string[],
  statementType: number // 0 = balance snapshot, 1 = full history, 2 = income summary
): Uint8Array {
  // Sort token balances by contract address (lowercase) for determinism
  const sortedTokens = [...tokenBalances].sort((a, b) => 
    a.address.toLowerCase().localeCompare(b.address.toLowerCase())
  )
  
  // Sort tx hashes for determinism
  const sortedTxHashes = [...txHashes].sort()

  // ABI encode everything in a fixed order
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      'address',     // wallet
      'uint256',     // chainId
      'uint256',     // blockNumber
      'uint256',     // periodStart
      'uint256',     // periodEnd
      'uint256',     // ethBalance
      'uint8',       // statementType
      'address[]',   // token addresses (sorted)
      'uint256[]',   // token balances (matching order)
      'bytes32[]'    // tx hashes (sorted)
    ],
    [
      wallet,
      chainId,
      blockNumber,
      periodStart,
      periodEnd,
      ethBalance,
      statementType,
      sortedTokens.map(t => t.address),
      sortedTokens.map(t => t.balance),
      sortedTxHashes
    ]
  )

  return ethers.getBytes(encoded)
}
```

**Step 4: Compute dataHash**
```typescript
const serialized = serializeStatementData(wallet, chainId, blockNumber, ...)
const dataHash = ethers.keccak256(serialized)
```

**Step 5: EIP-712 Typed Data Signing**

The user signs a structured message that binds the dataHash to the Fundslip domain. This prevents replay attacks and makes the signature useless outside Fundslip.

```typescript
const domain = {
  name: 'Fundslip',
  version: '1',
  chainId: chainId, // 1 for mainnet
  // No verifyingContract — this is an off-chain signature
}

const types = {
  Statement: [
    { name: 'wallet', type: 'address' },
    { name: 'blockNumber', type: 'uint256' },
    { name: 'periodStart', type: 'uint256' },
    { name: 'periodEnd', type: 'uint256' },
    { name: 'statementType', type: 'uint8' },
    { name: 'dataHash', type: 'bytes32' },
  ]
}

const value = {
  wallet: walletAddress,
  blockNumber: currentBlock,
  periodStart: periodStartTimestamp,
  periodEnd: periodEndTimestamp,
  statementType: 0, // 0=balance, 1=full history, 2=income
  dataHash: dataHash,
}

// This triggers the wallet popup for the user to sign
const signature = await signer.signTypedData(domain, types, value)
```

**Step 6: Build the compact verification payload**

Pack everything into a tight binary buffer, then Base58 encode it.

```typescript
import bs58 from 'bs58'

function buildVerificationPayload(
  wallet: string,
  chainId: number,
  blockNumber: number,
  periodStart: number,
  periodEnd: number,
  statementType: number,
  dataHash: string, // bytes32 hex
  signature: string // 65-byte hex
): string {
  // Total: 20 + 4 + 4 + 4 + 4 + 1 + 32 + 65 = 134 bytes
  const buffer = new Uint8Array(134)
  const view = new DataView(buffer.buffer)
  
  // Wallet address: 20 bytes
  const walletBytes = ethers.getBytes(wallet)
  buffer.set(walletBytes, 0)
  
  // Chain ID: 4 bytes (uint32)
  view.setUint32(4 + 16, chainId) // offset 20
  // Actually let's be precise:
  view.setUint32(20, chainId)
  
  // Block number: 4 bytes (uint32)
  view.setUint32(24, blockNumber)
  
  // Period start: 4 bytes (uint32 unix timestamp)
  view.setUint32(28, periodStart)
  
  // Period end: 4 bytes (uint32 unix timestamp)
  view.setUint32(32, periodEnd)
  
  // Statement type: 1 byte
  buffer[36] = statementType
  
  // Data hash: 32 bytes
  const hashBytes = ethers.getBytes(dataHash)
  buffer.set(hashBytes, 37)
  
  // Signature: 65 bytes
  const sigBytes = ethers.getBytes(signature)
  buffer.set(sigBytes, 69)
  
  return bs58.encode(buffer)
}
```

**Step 7: Embed in PDF + generate QR**

The compact payload gets embedded in three places:
1. **QR code on the PDF** → encodes `https://fundslip.xyz/verify?p=PAYLOAD`
2. **Visible text on PDF footer** → the Base58 payload string
3. **PDF metadata** → as a custom metadata field so it can be extracted programmatically when someone uploads the PDF for verification

```typescript
// For the QR code URL
const payload = buildVerificationPayload(wallet, chainId, blockNumber, periodStart, periodEnd, statementType, dataHash, signature)
const verifyUrl = `https://fundslip.xyz/verify?p=${payload}`

// For PDF metadata embedding
// When generating the PDF, set custom metadata:
// metadata: { fundslipPayload: payload }
```

---

### Verification Flow (when someone verifies a statement)

Three entry points, same logic:

1. **QR Scan / URL** → extract `p` parameter → decode
2. **PDF Upload** → parse PDF metadata → extract `fundslipPayload` → decode
3. **Manual paste** → user pastes the Base58 string → decode

**Step 1: Decode the compact payload**
```typescript
function decodeVerificationPayload(encoded: string): {
  wallet: string
  chainId: number
  blockNumber: number
  periodStart: number
  periodEnd: number
  statementType: number
  dataHash: string
  signature: string
} {
  const buffer = bs58.decode(encoded)
  
  if (buffer.length !== 134) {
    throw new Error('Invalid payload length')
  }
  
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  
  const wallet = ethers.hexlify(buffer.slice(0, 20))
  const chainId = view.getUint32(20)
  const blockNumber = view.getUint32(24)
  const periodStart = view.getUint32(28)
  const periodEnd = view.getUint32(32)
  const statementType = buffer[36]
  const dataHash = ethers.hexlify(buffer.slice(37, 69))
  const signature = ethers.hexlify(buffer.slice(69, 134))
  
  return { wallet, chainId, blockNumber, periodStart, periodEnd, statementType, dataHash, signature }
}
```

**Step 2: Verify the EIP-712 signature**
```typescript
const domain = {
  name: 'Fundslip',
  version: '1',
  chainId: decoded.chainId,
}

const types = {
  Statement: [
    { name: 'wallet', type: 'address' },
    { name: 'blockNumber', type: 'uint256' },
    { name: 'periodStart', type: 'uint256' },
    { name: 'periodEnd', type: 'uint256' },
    { name: 'statementType', type: 'uint8' },
    { name: 'dataHash', type: 'bytes32' },
  ]
}

const value = {
  wallet: decoded.wallet,
  blockNumber: decoded.blockNumber,
  periodStart: decoded.periodStart,
  periodEnd: decoded.periodEnd,
  statementType: decoded.statementType,
  dataHash: decoded.dataHash,
}

// Recover the signer from the signature
const recoveredSigner = ethers.verifyTypedData(domain, types, value, decoded.signature)

// THE CRITICAL CHECK: does the recovered signer match the claimed wallet?
if (recoveredSigner.toLowerCase() !== decoded.wallet.toLowerCase()) {
  throw new Error('SIGNATURE MISMATCH: The statement was not signed by the claimed wallet.')
}
```

**Step 3: Re-fetch on-chain data and verify the dataHash**
```typescript
// Use a public RPC to fetch the SAME data at the SAME block
const provider = new ethers.JsonRpcProvider(PUBLIC_RPC_URL)

const ethBalance = await provider.getBalance(decoded.wallet, decoded.blockNumber)

const tokenBalances = await Promise.all(
  TOKEN_LIST.map(async (token) => {
    const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
    const balance = await contract.balanceOf(decoded.wallet, { blockTag: decoded.blockNumber })
    return { address: token.address, balance: balance.toString() }
  })
)

// For full history / income: re-fetch tx hashes for the period
const transactions = await fetchTransactionHistory(decoded.wallet, decoded.periodStart, decoded.periodEnd)
const txHashes = transactions.map(tx => tx.hash).sort()

// Re-serialize using the EXACT same function
const serialized = serializeStatementData(
  decoded.wallet, decoded.chainId, decoded.blockNumber,
  decoded.periodStart, decoded.periodEnd,
  ethBalance, tokenBalances, txHashes, decoded.statementType
)

// Re-compute the hash
const recomputedHash = ethers.keccak256(serialized)

// THE SECOND CRITICAL CHECK: does the recomputed hash match the signed hash?
if (recomputedHash !== decoded.dataHash) {
  throw new Error('DATA MISMATCH: The statement data does not match on-chain records.')
}

// If we get here: VERIFIED
// The wallet owner signed this exact data, and the data matches the blockchain
```

**Step 4: Display the verified result**

Show the verifier:
- The wallet address (recovered from signature, NOT from the URL)
- The ENS name if available
- The verified balance / holdings (re-fetched from chain)
- The block number and timestamp
- The period covered
- A clear "VERIFIED" badge

---

## PDF UPLOAD VERIFICATION

When someone uploads a PDF:

1. Parse the PDF to extract custom metadata field `fundslipPayload`
   - Use a PDF parsing library (pdf-lib or pdf-parse)
   - The payload is the Base58 string stored during generation
   
2. If metadata is found → decode and verify using the exact same flow above

3. If metadata is NOT found (someone uploaded a random PDF) → show error: "This PDF does not contain Fundslip verification data."

```typescript
import { PDFDocument } from 'pdf-lib'

async function extractPayloadFromPDF(file: File): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  
  // Check custom metadata
  const metadata = pdfDoc.getCustomMetadata?.('fundslipPayload')
  if (metadata) return metadata
  
  // Fallback: check Info dict
  // pdf-lib may store it differently — adapt as needed
  return null
}
```

---

## QR CODE REAL-TIME SCANNING

When the camera scans a QR code:
1. Decode the QR → should be a URL like `https://fundslip.xyz/verify?p=PAYLOAD`
2. Extract the `p` parameter
3. Immediately run verification (no extra button click needed)
4. Stop the camera once a valid QR is detected
5. Show result

```typescript
// In the QR scanner component
function onQRCodeDetected(decodedText: string) {
  try {
    const url = new URL(decodedText)
    const payload = url.searchParams.get('p')
    if (!payload) throw new Error('No payload in URL')
    
    // Stop camera
    scanner.stop()
    
    // Run verification
    verifyPayload(payload)
  } catch {
    // Not a valid Fundslip QR — keep scanning silently
    // Don't show errors for every random QR code the camera sees
  }
}
```

---

## SECURITY CONSIDERATIONS (implement all of these)

### 1. Display recovered signer, not claimed signer
The verification result MUST show the address recovered from `ethers.verifyTypedData`, NOT the address extracted from the URL payload. These should match (that's what we verify), but always display the cryptographically recovered one as the "Verified Wallet."

### 2. RPC transparency
Show which RPC provider was used for on-chain data. In the verification result, include a subtle line: "On-chain data verified via [provider name]". For advanced users, allow them to input their own RPC URL.

### 3. Chain ID binding
The EIP-712 domain includes `chainId`. A signature from Ethereum mainnet (chainId: 1) cannot be replayed on Arbitrum (chainId: 42161) or any other chain. This is automatic with EIP-712.

### 4. Flash loan defense
For Balance Snapshot type, check if there are any large incoming AND outgoing transfers in the same block as the pinned blockNumber. If yes, flag it in the verification result: "Warning: Large same-block transfers detected. This balance may not reflect sustained holdings." This is informational, not a hard failure.

### 5. Timestamp validation
Check that `periodEnd` is not in the future and `periodStart` is before `periodEnd`. Check that `blockNumber` existed at or after `periodEnd` (the snapshot should be at or after the end of the reporting period).

---

## FILE STRUCTURE FOR VERIFICATION CODE

```
src/lib/
  verification/
    serialize.ts        → serializeStatementData() — THE canonical serialization
    sign.ts             → EIP-712 domain, types, signing logic
    payload.ts          → buildVerificationPayload() + decodeVerificationPayload()
    verify.ts           → Full verification flow (signature check + on-chain re-fetch + hash comparison)
    pdf-extract.ts      → Extract payload from uploaded PDF metadata
    constants.ts        → EIP-712 domain config, token list, RPC URLs
```

**CRITICAL: The `serializeStatementData` function is used in BOTH generation AND verification. It MUST be a single shared function. If generation and verification use different serialization, hashes will never match. Put it in one file, import it in both places.**

---

## DEPENDENCIES

```bash
npm install ethers bs58 pdf-lib
```

- `ethers` (v6) — EIP-712 signing, ABI encoding, keccak256, RPC calls
- `bs58` — compact Base58 encoding for URL payload
- `pdf-lib` — embed and extract custom metadata from PDFs

If you're already using `viem` instead of `ethers`, that's fine — viem has equivalent functions for everything above (`verifyTypedData`, `encodePacked`, `keccak256`, etc.). Use whichever is already in the project.

---

## TESTING CHECKLIST

After implementation, verify these scenarios:

1. **Generate → copy payload → verify via manual paste** → should show VERIFIED with correct balances
2. **Generate → scan QR from PDF** → should auto-verify and show VERIFIED
3. **Generate → upload the PDF** → should extract metadata and show VERIFIED
4. **Take a valid payload, change one character** → should show SIGNATURE MISMATCH
5. **Generate a PDF, edit the PDF visually (change a balance number), re-upload** → should still show VERIFIED (because we verify the signed dataHash against on-chain data, not the PDF's visual content — the edited visual is irrelevant)
6. **Generate from wallet A, claim it's wallet B** → recovered signer won't match → FORGERY DETECTED
7. **Try to verify a non-Fundslip PDF upload** → should show "No verification data found"
8. **Try to verify with a different chainId** → signature won't verify → INVALID

Build this right. The math is the product.