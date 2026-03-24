# QA Audit Report

**Date:** March 24, 2026
**Scope:** Full codebase audit
**Auditor:** Claude Code (ULTRATHINK mode)

## Executive Summary

Fundslip is a Next.js 16 client-side app that generates cryptographically signed Ethereum financial statements as PDFs, verifiable via EIP-712 signatures. The architecture is well-designed — deterministic ABI serialization, compact Base58 payloads, and a clear separation between generation and verification. However, the QR code scanning flow is completely broken due to a parameter name mismatch, a tracked token has a malformed address, the email feature silently fails, and the network selector UI is decorative. The cryptographic core is sound; the bugs are in the plumbing around it.

## Stats
- Critical: 1
- High: 4
- Medium: 5
- Low: 3

## Critical Issues

### [ISSUE-001] QR scanner checks wrong URL parameter — scanning always fails
- **Severity:** Critical
- **Location:** `src/components/verify/qr-scanner.tsx:21` — `QrScanner` onScan callback
- **What:** The QR scanner extracts `url.searchParams.get("hash")` but the app generates QR codes with the `?p=` parameter (`src/lib/pdf.ts:311`, `src/components/generate/statement-result.tsx:36`). When a user scans a Fundslip QR code, the URL parses successfully but `"hash"` returns `null`. The fallback check (`decodedText.startsWith("0x")`) also fails because the decoded text is a full `https://` URL, not a hex string. Result: every scan shows "Not a Fundslip QR code."
- **Reproduce:** Generate a statement, open the PDF, scan the QR code with the verify page's camera scanner.
- **Impact:** One of the three main verification methods (Scan QR / Upload PDF / Paste Code) is completely non-functional. Users who try to scan the QR code printed on the statement get a false error.

## High Issues

### [ISSUE-002] cbETH token address is malformed — 43 characters instead of 42
- **Severity:** High
- **Location:** `src/lib/constants.ts:25` — `TRACKED_TOKENS` array
- **What:** The cbETH address `0xBe9895146f7AF43049ca1c1AE358B0541Ea49BBea` is 43 characters (41 hex digits after `0x`). Valid Ethereum addresses are exactly 42 characters (40 hex digits). The correct mainnet address ends in `...49BBe`, not `...49BBea`. This malformed address is cast via `as Address`, bypassing TypeScript checks. The multicall to `balanceOf` for this contract will silently fail or return incorrect data.
- **Reproduce:** Connect a wallet that holds cbETH. The balance won't appear in the statement.
- **Impact:** Any user holding Coinbase Wrapped Staked ETH (cbETH) will see it missing from their statement. Their total balance will be understated.

### [ISSUE-003] Email send shows success regardless of server response
- **Severity:** High
- **Location:** `src/components/generate/statement-result.tsx:51-65` — `handleSendEmail`
- **What:** The `fetch("/api/send-statement", ...)` call sets `setEmailSent(true)` after the fetch resolves, but never checks `response.ok` or the response status. If the server returns 400 (invalid email), 429 (rate limited), or 500 (Resend API failure), the UI still shows "Sent to user@example.com" with a green checkmark.
- **Reproduce:** Enter an invalid email or trigger the rate limit (5 emails/minute), then click Send.
- **Impact:** Users believe their statement was delivered when it wasn't. No way to know the email failed.

### [ISSUE-004] Network selector has no effect on data fetching
- **Severity:** High
- **Location:** `src/hooks/use-statement.ts:35,98` — `networks` state vs `chainId` usage
- **What:** The `networks` state array and `toggleNetwork` function are rendered in `NetworkSelector` but completely ignored during generation. The `generate` function uses `chainId` from `useChainId()` / `useAccount()` (the wallet's connected chain), not the user's UI selection. A user can select "Optimism" and "Arbitrum" in the UI, but the app will still fetch Ethereum mainnet data if that's what the wallet is connected to.
- **Reproduce:** Connect wallet to Ethereum mainnet, select Optimism in the network selector, generate a statement. The statement shows Ethereum data.
- **Impact:** Misleading UI. Users believe they're configuring which network to query, but it has zero effect.

### [ISSUE-005] In-memory rate limiter is ineffective on serverless
- **Severity:** High
- **Location:** `src/app/api/send-statement/route.ts:17-31` — `rateLimitMap`
- **What:** The rate limiter uses a module-scoped `Map` that resets on every cold start. On Vercel (the likely deployment target for a Next.js app), each serverless function invocation can be a fresh instance. An attacker can bypass the rate limit entirely by making requests fast enough to hit different instances, or by simply waiting for a cold start. The `rateLimitMap` also grows unboundedly — it never evicts expired entries.
- **Reproduce:** Deploy to Vercel, send 100 emails in rapid succession. Many will succeed because they hit different instances.
- **Impact:** The only API endpoint in the app has no meaningful abuse protection. An attacker could use it to send bulk spam emails from the `statements@fundslip.xyz` domain, potentially getting the domain blacklisted.

## Medium Issues

### [ISSUE-006] Email feature never attaches the PDF
- **Severity:** Medium
- **Location:** `src/components/generate/statement-result.tsx:58` — `pdfBase64: ""`
- **What:** The email send payload hardcodes `pdfBase64: ""`. The API route conditionally attaches the PDF only when `pdfBase64` is truthy (`route.ts:106`). Since it's always an empty string, no PDF is ever attached. Recipients receive a notification email with a fingerprint hash and verification link, but not the actual statement.
- **Reproduce:** Generate a statement, email it to yourself. The email arrives without a PDF attachment.
- **Impact:** The email feature is functionally incomplete. Recipients must visit the website to see the statement — they can't just open the attachment.

### [ISSUE-007] Three orphaned modules with heavy imports
- **Severity:** Medium
- **Location:** `src/lib/crypto.ts`, `src/lib/signature.ts`, `src/lib/verify.ts`
- **What:** These three files are never imported by any component, page, or other module. They appear to be the original verification system (SIWE-based + PDF hash binding) that was replaced by the current `src/lib/verification/` module (EIP-712 + ABI-encoded data hash). They still import `siwe`, `viem`, and other dependencies. While tree-shaking should exclude them from the client bundle, they add confusion and maintenance burden.
- **Reproduce:** `grep -r "from.*lib/crypto\|from.*lib/signature\|from.*lib/verify" src/` — no results from any non-dead file.
- **Impact:** Dead code. If tree-shaking misses them (e.g., in server-side rendering), they bloat the bundle. More importantly, they create confusion — a developer might modify `crypto.ts` thinking it's the active verification path.

### [ISSUE-008] Clipboard API calls have no error handling
- **Severity:** Medium
- **Location:** `src/components/generate/statement-result.tsx:40,46`, `src/components/verify/verify-result.tsx:21`, `src/components/shared/copy-button.tsx:11`, `src/components/layout/navbar.tsx:86`
- **What:** All `navigator.clipboard.writeText()` calls are unguarded — no try/catch, no feature detection. The Clipboard API requires a secure context (HTTPS) and user gesture. In localhost HTTP during development, or in browsers that haven't granted clipboard permission, these calls throw a `DOMException` that bubbles up as an unhandled promise rejection.
- **Reproduce:** Run `npm run dev` (HTTP localhost), click "Copy address" in the navbar wallet dropdown.
- **Impact:** Copy buttons silently fail in non-secure contexts. In production (HTTPS) this is unlikely to trigger, but during development or in embedded webviews it will break.

### [ISSUE-009] No request body size limit on email API endpoint
- **Severity:** Medium
- **Location:** `src/app/api/send-statement/route.ts:41` — `request.json()`
- **What:** The API endpoint parses the full request body with `request.json()` before any validation. While user-provided strings are truncated after parsing (`slice(0, 50)`, etc.), the `pdfBase64` field has no size check. An attacker could send a multi-gigabyte JSON body. Even though the client currently sends `pdfBase64: ""`, the endpoint accepts arbitrary values from any HTTP client.
- **Reproduce:** `curl -X POST /api/send-statement -d '{"email":"a@b.com","pdfBase64":"<100MB string>"}'`
- **Impact:** Memory exhaustion on the server function. Combined with ISSUE-005's broken rate limiter, this is exploitable.

### [ISSUE-010] Blob URL leaks on navigation away from generate page
- **Severity:** Medium
- **Location:** `src/hooks/use-statement.ts:224,250-260` — `pdfBlobUrl` lifecycle
- **What:** `URL.createObjectURL(signedBlob)` creates a blob URL at line 224. The `reset()` function at line 257 properly revokes it. However, if the user navigates away from `/generate` (e.g., clicks "Home" or closes the tab) without clicking "New Statement", the blob URL is never revoked. The `useStatement` hook has no unmount cleanup for the blob URL.
- **Reproduce:** Generate a statement successfully, then click the Fundslip logo to go home. The blob URL remains allocated.
- **Impact:** Minor memory leak. Each leaked blob URL holds the entire PDF in memory until the tab is closed. For a single-use app this is negligible, but repeated generate-and-navigate cycles accumulate.

## Low Issues

### [ISSUE-011] `puppeteer-core` is an unused dependency
- **Severity:** Low
- **Location:** `package.json:28` — `"puppeteer-core": "^24.40.0"`
- **What:** `puppeteer-core` is listed in production dependencies but is never imported anywhere in the source code. It's a large package (~30MB installed) that provides headless browser automation — completely unnecessary for this client-side app.
- **Reproduce:** `grep -r "puppeteer" src/` returns no results.
- **Impact:** Increased `npm install` time and disk usage. No runtime impact (tree-shaking excludes it from bundles).

### [ISSUE-012] `@types/bs58` and `@types/qrcode` are in `dependencies` instead of `devDependencies`
- **Severity:** Low
- **Location:** `package.json:15-16`
- **What:** Type definition packages (`@types/bs58`, `@types/qrcode`) are listed under `dependencies` instead of `devDependencies`. Additionally, `@types/bs58` is version 4.x types but the installed `bs58` is version 6.x which ships its own types. The v4 types may conflict.
- **Reproduce:** N/A — no runtime impact.
- **Impact:** Cosmetic dependency hygiene issue. Could cause confusing type errors if `@types/bs58` v4 types shadow the correct v6 types.

### [ISSUE-013] `Object.assign(tokenPrices, extra)` mutates caller's parameter
- **Severity:** Low
- **Location:** `src/lib/ethereum.ts:109` — inside `getTransactionHistory`
- **What:** The `tokenPrices` parameter passed to `getTransactionHistory` is mutated via `Object.assign`. Since JavaScript objects are passed by reference, this mutates the `prices` object in `use-statement.ts:157`. The current code happens to work because the caller doesn't depend on `prices` being unchanged after this call, but it's a fragile pattern that could break if the generation flow is reordered.
- **Reproduce:** N/A — works correctly today by coincidence.
- **Impact:** No current bug, but a maintenance hazard.

## Areas Reviewed — No Issues Found

- **Cryptographic core (EIP-712 signing, ABI serialization, dataHash computation):** The `src/lib/verification/` module is well-architected. Deterministic serialization via ABI encoding, proper field ordering, and correct use of `verifyTypedData` in verification. The separation of concerns between serialize, sign, payload, and verify is clean.
- **XSS / Injection:** The email HTML template properly escapes all user input via `escapeHtml()`. The `dangerouslySetInnerHTML` in `layout.tsx` only renders static JSON-LD. No user input reaches `innerHTML` or `eval`.
- **Secrets in source:** `.env.local` is properly gitignored and was never committed to git history. Only `.env.example` (with empty values) is tracked.
- **PDF generation:** The `jspdf` + `autotable` pipeline is solid. Page breaks are handled, QR codes are properly embedded, and the fingerprint is both visible and machine-readable (via PDF metadata Subject field).
- **Accessibility basics:** Focus states are present via Tailwind's `focus:ring-*` classes. `prefers-reduced-motion` is respected in `globals.css`. Semantic HTML (`nav`, `main`, `footer`, `header`) is used correctly.
- **Mobile responsiveness:** Responsive breakpoints are applied consistently. The navbar has a proper mobile hamburger menu. Grid layouts collapse from multi-column to single-column.
- **State management:** React Query + wagmi hooks are properly initialized with stable `QueryClient` via `useState`. No provider duplication issues.
- **Date/time handling:** Period date construction in `use-statement.ts` correctly uses `T00:00:00` and `T23:59:59` suffixes to avoid timezone ambiguity. Calendar component properly handles month boundaries.

## Architecture Notes

1. **Dual verification system:** The codebase contains two complete verification systems — the current `src/lib/verification/` (EIP-712 + ABI-encoded data hash in compact Base58 payload) and the old `src/lib/crypto.ts` + `src/lib/signature.ts` + `src/lib/verify.ts` (SIWE + PDF hash binding). The old system should be removed to prevent confusion.

2. **Bundle size awareness:** The app dynamically imports heavy modules (`@/lib/pdf`, `@/lib/verification`, `pdfjs-dist`, `html5-qrcode`) which is good for initial load. However, `puppeteer-core` in dependencies is a red flag for anyone auditing the package.

3. **The privacy claim vs. the email API:** The privacy page states "Everything happens in your browser. There is no backend." This is mostly true, but the `/api/send-statement` route IS a backend endpoint that processes user-provided email addresses and names. The privacy page acknowledges this in the "Email delivery" section, but the headline claim is slightly misleading.
