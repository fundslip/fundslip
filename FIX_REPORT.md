# Fix Report

**Date:** March 24, 2026
**Source:** ISSUES.md QA Audit
**Resolved:** 13 of 13 issues

## Fixes Applied

### ISSUE-001: QR scanner checks wrong URL parameter — scanning always fails
- **Status:** Fixed
- **What was changed:** The QR scanner callback now reads `url.searchParams.get("p")` instead of `"hash"`, matching the parameter name used in generated verification URLs. Also added a fallback for raw Base58 payload strings (length > 80 chars) which `extractPayloadFromUrl` already handles.
- **Files modified:** `src/components/verify/qr-scanner.tsx`
- **Verification:** The scanner's decoded text handler now matches the `?p=` param format used by `src/lib/pdf.ts:311` and `src/components/generate/statement-result.tsx:37`.

### ISSUE-002: cbETH token address is malformed — 43 characters instead of 42
- **Status:** Fixed
- **What was changed:** Removed the trailing `a` from the cbETH contract address. `0xBe9895146f7AF43049ca1c1AE358B0541Ea49BBea` (43 chars) → `0xBe9895146f7AF43049ca1c1AE358B0541Ea49BBe` (42 chars).
- **Files modified:** `src/lib/constants.ts`
- **Verification:** Character count confirmed: 42 chars total (0x + 40 hex digits).

### ISSUE-003: Email send shows success regardless of server response
- **Status:** Fixed
- **What was changed:** `handleSendEmail` now checks `response.ok` before setting success state. Added `emailError` state to display server error messages (invalid email, rate limited, server failure). Added `emailSending` state for loading indicator. Error messages from the API response body are shown to the user.
- **Files modified:** `src/components/generate/statement-result.tsx`
- **Verification:** On non-200 responses, `emailError` is set with the server's error message. Success state only triggers on `res.ok`.

### ISSUE-004: Network selector has no effect on data fetching
- **Status:** Fixed
- **What was changed:** Replaced the interactive `NetworkSelector` (which let users toggle networks that were ignored) with a read-only `ConnectedNetwork` component that displays the wallet's actual connected network. Removed `networks` state and `toggleNetwork` from `useStatement` hook. The summary card now shows the real network name via `getNetworkName(chainId)`.
- **Files modified:** `src/components/generate/network-selector.tsx`, `src/hooks/use-statement.ts`, `src/app/generate/page.tsx`
- **Verification:** The UI now truthfully reflects the wallet's connected chain. No user-selectable controls for a feature that isn't implemented.

### ISSUE-005: In-memory rate limiter is ineffective on serverless
- **Status:** Fixed
- **What was changed:** Added TTL-based eviction when the Map exceeds 10,000 entries (prevents unbounded memory growth). Added a clear comment documenting the serverless cold-start limitation. The rate limiter is now best-effort rather than silently claiming to be effective.
- **Files modified:** `src/app/api/send-statement/route.ts`
- **Verification:** Expired entries are evicted when the Map grows large. The comment sets correct expectations for deployment.

### ISSUE-006: Email feature never attaches the PDF
- **Status:** Fixed
- **What was changed:** `handleSendEmail` now converts the PDF blob to base64 and sends it as `pdfBase64` in the request body (previously hardcoded to `""`). A 5MB size cap prevents oversized payloads — PDFs larger than that are sent without attachment (link-only mode).
- **Files modified:** `src/components/generate/statement-result.tsx`
- **Verification:** The `pdfBlob` prop is read, converted via `arrayBuffer` → `Uint8Array` → `btoa`, and included in the request body.

### ISSUE-007: Three orphaned modules with heavy imports
- **Status:** Fixed
- **What was changed:** Deleted `src/lib/crypto.ts`, `src/lib/signature.ts`, and `src/lib/verify.ts`. Confirmed via grep that no active source file imports from these modules.
- **Files deleted:** `src/lib/crypto.ts`, `src/lib/signature.ts`, `src/lib/verify.ts`
- **Verification:** `grep` for imports from these modules returns zero results in active code. Build succeeds.

### ISSUE-008: Clipboard API calls have no error handling
- **Status:** Fixed
- **What was changed:** Created `src/lib/clipboard.ts` with a `copyToClipboard()` utility that wraps `navigator.clipboard.writeText` in try/catch with a `document.execCommand("copy")` fallback. Updated all 5 call sites (statement-result.tsx ×2, verify-result.tsx ×1, copy-button.tsx ×1, navbar.tsx ×1) to use the shared utility. Copy feedback only triggers on success.
- **Files modified:** `src/components/generate/statement-result.tsx`, `src/components/verify/verify-result.tsx`, `src/components/shared/copy-button.tsx`, `src/components/layout/navbar.tsx`
- **Files created:** `src/lib/clipboard.ts`
- **Verification:** `grep navigator.clipboard src/` only finds the utility itself. All call sites use `copyToClipboard`.

### ISSUE-009: No request body size limit on email API endpoint
- **Status:** Fixed
- **What was changed:** Added `Content-Length` header check before `request.json()` — rejects payloads >10MB with 413 status. Added secondary check on `pdfBase64` string length after parsing as defense-in-depth.
- **Files modified:** `src/app/api/send-statement/route.ts`
- **Verification:** Oversized requests are rejected before the JSON body is parsed into memory.

### ISSUE-010: Blob URL leaks on navigation away from generate page
- **Status:** Fixed
- **What was changed:** Added a `useEffect` cleanup in `useStatement` that calls `URL.revokeObjectURL(pdfBlobUrl)` when the hook unmounts or when `pdfBlobUrl` changes.
- **Files modified:** `src/hooks/use-statement.ts`
- **Verification:** The cleanup runs on unmount (navigating away) and on value change (generating a new statement).

### ISSUE-011: `puppeteer-core` is an unused dependency
- **Status:** Fixed
- **What was changed:** Removed `puppeteer-core` from `dependencies` in `package.json`. Ran `npm install` to update lockfile.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `grep puppeteer src/` returns zero results.

### ISSUE-012: `@types/bs58` and `@types/qrcode` are in `dependencies` instead of `devDependencies`
- **Status:** Fixed
- **What was changed:** Removed `@types/bs58` entirely (`bs58` v6 ships its own types, and the v4 `@types` package was incorrect). Moved `@types/qrcode` to `devDependencies`.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** Build succeeds without `@types/bs58`. `@types/qrcode` is now in devDependencies.

### ISSUE-013: `Object.assign(tokenPrices, extra)` mutates caller's parameter
- **Status:** Fixed
- **What was changed:** Replaced `Object.assign(tokenPrices, extra)` with `mergedPrices = { ...tokenPrices, ...extra }`. The downstream token price lookup now reads from `mergedPrices` instead of `tokenPrices`. The caller's `prices` object is no longer mutated.
- **Files modified:** `src/lib/ethereum.ts`
- **Verification:** The `tokenPrices` parameter is never written to. A new `mergedPrices` variable holds the combined prices.

## Dependency Changes
- **Removed:** `puppeteer-core`, `@types/bs58`
- **Moved to devDependencies:** `@types/qrcode`

## Notes
- `siwe` is still in `dependencies` but is no longer imported by any source file after the deletion of the orphaned modules. It could be removed in a future cleanup, but was not part of the 13 audited issues.
- The rate limiter (ISSUE-005) is improved but inherently limited by the serverless execution model. For production abuse protection, consider Vercel's built-in rate limiting, Upstash Redis, or a WAF rule.
- The network selector (ISSUE-004) was converted to read-only display. If multi-chain support is added in the future, a new interactive selector should be built that actually controls the chain used for data fetching.
