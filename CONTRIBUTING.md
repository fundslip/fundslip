# Contributing to Fundslip

Thanks for your interest in contributing. Fundslip is a small, focused project and every contribution matters.

## Setup

```bash
git clone https://github.com/fundslip/fundslip.git
cd fundslip
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

The only optional environment variable is `RESEND_API_KEY` for email delivery. Everything else works out of the box with public Ethereum RPC nodes.

## What to contribute

- Bug fixes
- New ERC-20 token support (add to `src/lib/constants.ts`)
- L2 network support (Optimism, Arbitrum, Base)
- UI improvements
- Documentation
- Accessibility improvements
- Test coverage

## How to contribute

1. Fork the repository
2. Create a branch (`git checkout -b fix/something`)
3. Make your changes
4. Run `npm run build` to ensure it compiles
5. Open a pull request

Keep PRs focused on a single change. Describe what you changed and why.

## Code style

- TypeScript, strict mode
- Tailwind CSS 4 for styling
- Next.js 16 App Router conventions
- Functional components with hooks
- Keep it minimal. If in doubt, write less code.

## Project structure

- `src/lib/verification/` is the cryptographic core. Changes here need extra care.
- `src/lib/ethereum.ts` handles on-chain data fetching.
- `src/lib/pdf.ts` generates the PDF document.
- `src/hooks/use-statement.ts` orchestrates the generation flow.
- `src/components/` is the UI layer. Most contributions will be here.

## Questions?

Open an issue or reach out on [X (@fundslip)](https://x.com/fundslip).
