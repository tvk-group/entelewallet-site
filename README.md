# EnteleWALLET Site

Official public website for **EnteleWALLET** — marketing, trust, security, roadmap, documentation, and domain verification.

- **Website:** https://entelewallet.com
- **Wallet app (separate repo):** https://app.entelewallet.com

This repository is **not** the wallet application. The current public product positioning is **EnteleWALLET Lite** — a secure wallet-connected dashboard for verification and read-only monitoring.

## Development

```bash
npm install
npm run build      # Generate all HTML pages from messages + templates
npm run i18n:check # Validate all 25 locale files against messages/en.json
npm run chains:check  # Validate modular chain registry
npm run chains:verify # Run RPC/explorer verification tests (optional --write)
npm run typecheck  # Type-check config/languages.ts and chain-registry
```

## Structure

| Path | Purpose |
|------|---------|
| `messages/*.json` | i18n source (25 languages, `en.json` is master) |
| `config/languages.json` | Official 25-language list |
| `config/chain-registry/` | Modular chain registry (Phase 1 EVM networks, TVK modules, BlockDAG Mainnet experimental) |
| `scripts/build.mjs` | Static site generator |
| `scripts/check-chain-registry.mjs` | Validates chain registry schema and security rules |
| `scripts/verify-chains.mjs` | RPC, explorer, and detection verification tests |
| `scripts/check-i18n.mjs` | Translation completeness checker |
| `assets/site.css` | Shared styles |
| `assets/site.js` | Client-side i18n runtime |
| `*.html` (in `dist/`) | Generated pages — run `npm run build` before deploy |

Vercel deploys the `dist/` folder (`outputDirectory` in `vercel.json`).

## Pages

`/`, `/features`, `/security`, `/ecosystem`, `/networks`, `/roadmap`, `/docs`, `/domains`, `/contact`, `/legal`, `/privacy`, `/terms`, `/risk`, `/faq`

## Deploy

Deployed on Vercel with `cleanUrls: true` — `features.html` is served at `/features`.
