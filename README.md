# IMDerivatives

An independent, read-only directory of projects built around Identity MD. Built around IMD ≠ built by IMD. No wallet, trading, minting, approvals, investment recommendations or price predictions are included.

The site contains four researched listings, category/status filters, text and address search, sorting, shareable hash routes, claim-level sources, contract copy controls, and warnings before leaving for an unverified project. Counts derive from the project data.

Since 29 September 2026 it also carries an **ecosystem market dashboard**: tracked market cap, 24h tracked volume, projects tracked, market data available, a donut chart of market-cap share computed from the data, a legend with exact values, compact market metrics on each project card (price, market cap, 24h volume, 24h change, market-data-updated timestamp) and a full market-data section with definitions and limitations in each detail view. Market data is identified by chain + contract address only, comes from public key-free APIs (DexScreener for tokens, OpenSea marketplace statistics for the NFT collection), is committed as a timestamped snapshot, and can be refreshed on request in the browser. Missing metrics render as N/A and are excluded from every total. The NFT collection is shown with marketplace figures only and has no market cap. Market figures are third-party claims about trading activity, not endorsement, investment quality or proof of safety.

## Deliverables

- Static export: [`dist/index.html`](dist/index.html), with local relative assets; also `dist/projects.json`, `dist/market.json`, `dist/RESEARCH.md`.
- Project data: [`src/data/projects.json`](src/data/projects.json) (now with a per-project `color` and a `market` identification block); market snapshot: [`src/data/market.json`](src/data/market.json); types: [`src/types.ts`](src/types.ts).
- Market-data layer: [`scripts/fetch-market.mjs`](scripts/fetch-market.mjs) (snapshot generator) and [`src/market/normalize.mjs`](src/market/normalize.mjs) (shared normalisation used by the script and the browser); UI in [`src/market.tsx`](src/market.tsx).
- Research, identification recipe and limitations: [`RESEARCH.md`](RESEARCH.md) (section "Market data").
- Implemented design: [`DESIGN.md`](DESIGN.md).
- Worker validation and Better Interface review: [`artifacts/validation.md`](artifacts/validation.md). Screenshots were inspected in the seat's browser tool but could not be written into the workspace, so none are included.
- Publication state and export fingerprint: [`artifacts/publication.json`](artifacts/publication.json).

## Install and rebuild

Requirements: Node.js 22.12+ and npm. This update was validated with Node 22.23.2 and npm 10.9.8. React, TypeScript and Vite versions are pinned in the package manifest and lockfile; no dependency was added (the chart is hand-written SVG).

The assignment prohibits dependency directories in the repository. This command installs the locked dependencies into a disposable staging directory under `$TMPDIR` (or `/tmp`), checks types and project/market data, builds, and replaces `dist/` only after success:

```sh
bash scripts/build-isolated.sh
```

It uses `npm ci`, `npm run typecheck`, `npm run check:data`, and `npm run build`. The build is fully offline: it reads the committed `src/data/market.json` and never contacts a market API. The source, manifests and lockfile stay in this repository; packages and the npm cache remain outside it. Nothing under `test/scratch/` is needed to build.

In a normal development checkout where local dependency installation is allowed, `npm ci` followed by `npm run dev` starts Vite, and `npm run preview` serves the finished export after a build. Never include any `node_modules`, package cache, tool scratch directory or dependency archive in a submission. No ignore file was created or modified by this task.

## Refresh the market snapshot

```sh
node scripts/fetch-market.mjs      # needs network; writes src/data/market.json with a new timestamp
node scripts/check-data.mjs        # verifies contracts, N/A handling, chart math and totals
bash scripts/build-isolated.sh     # rebuilds dist/ from the new snapshot
```

The script reads each listing's `market` block, requests DexScreener `token-pairs/v1/{chain}/{contract}` for tokens and the OpenSea collection record plus `stats` for the NFT collection, keeps only results that match the listed contract, and writes nulls (rendered as N/A) with the error text when a source fails. It uses no API key. If Node's `fetch` needs the sandbox proxy, set `NODE_USE_ENV_PROXY=1`. Review the printed summary before committing; never hand-edit numbers into the snapshot.

## Preview the finished website

No frontend dependencies are needed to serve the delivered static export:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/`. Stop with Ctrl+C. This local address is a preview, not a public website. Serve over HTTP(S); opening an ES module app directly with `file://` is not supported. The snapshot works without a connection. Opening an external evidence link or pressing "Refresh from DexScreener" requires the network; a failed refresh keeps the snapshot and says so. After rebuilding, hard-reload the preview: `index.html` may be cached by the browser even though the hashed asset names change.

For this update the worker used the seat's browser tool, which serves the task directory at a local address, and inspected `dist/index.html` there at 1440, 900, 390 and 320 CSS-pixel widths. That browser has no internet, so the live-refresh success path was exercised with the real API responses replayed from local files (see `artifacts/validation.md`).

## Publish

Upload **the contents of `dist/`** to a static host. Do not publish the repository root. No server rewrite or build-on-host is required. `vite.config.ts` uses `base: './'`; all views use hash routes such as `#project/nosh` and `#market`, so subpath and gateway hosting work. Keep `assets/`, `favicon.svg`, `projects.json`, `market.json` and `RESEARCH.md` beside `index.html` exactly as exported.

The intended publisher should include the source, package manifest, lockfile, documentation, required assets and full `dist/` in the Git submission. This worker did not commit: the assignment prohibits touching `.git/`, and the network's daemon creates the commit from the submitted tree. Base commit of this update: `ed78a62` (the parent job's accepted tree). No remote repository URL, authenticated publishing tool or hosting destination was supplied, so the public URL and the new commit hash are assigned by the network after review and **public deployment remains unconfirmed by this worker**. `artifacts/publication.json` records this and the SHA-256 fingerprint of the ready export.

After publication, the publisher should load the public URL, confirm the market dashboard and donut render with the snapshot timestamp, open one direct hash route (`#project/tokenworks`) and compare the exported file hashes. Do not substitute these local worker checks for a public-host check.

## Add or review a listing

Add a record to `src/data/projects.json` following `src/types.ts`. Use a unique id; a distinct `color` (used for the card symbol and the chart slice); explicit category array; one allowed primary status; contract addresses with chain, explorer link and verification scope; a `market` block whose `contractAddress` and `chain` match one of the listed contracts (`kind: 'token'` with `dexscreenerChain`, or `kind: 'nft'` with `openseaCollection`/`openseaChain`) and a `sourceIds` entry pointing at the market-data source; risk flags with evidence kinds; and dated sources with unique ids. Every prose claim should reference source ids from the same listing. Contract source verification and audit status are separate from address identification, and market figures are separate from both.

`npm run check:data` validates expected initial listings, source references, addresses, links, classification totals, the market identification block, the snapshot's N/A handling and the chart math. When deliberately adding future projects, update its initial-scope assertions as well. Update `RESEARCH.md` and review dates, refresh the snapshot, run the isolated build, and recheck the rendered directory. Counts, totals and chart shares update from the data; new decorative symbols fall back to the directory mark.

## Actual check results

For this update: `npm run typecheck` (tsc --noEmit) passed; `node scripts/check-data.mjs` passed (3 comparable market caps totalling $879,722, rounded shares 100.1%, 3 token volumes totalling $650,498, 1 N/A excluded); `npm run build` produced `dist/` (32 modules, ~260 kB JS / ~33 kB CSS before gzip). Browser checks on the final export: dashboard tiles, donut slices and legend values match the snapshot; hover on a slice and click/focus on a legend item update the readout and dim the other slices; the readout returns to its prompt on leave; the refresh button reports failure honestly when the API is unreachable and, with replayed real responses, switches the badge to LIVE, recomputes totals and shares, and keeps previous values for a project whose request fails; detail views show the market section with definitions; no horizontal overflow at 320 px; zero console errors apart from the expected blocked network requests during the refresh test. Measured text contrast for every new text role is 7.36:1 or better on its rendered surface. Native browser zoom, a real screen reader, physical devices, other browser engines and a live (unmocked) DexScreener refresh in the browser were not tested. Full coverage, findings, fixes and limitations are in `artifacts/validation.md`.

## Attribution

Space Grotesk is bundled locally under its SIL Open Font License, retained in `src/assets/OFL.txt` and the production assets. Project symbols are original abstract pixel marks, not official project logos. Market data is reproduced from DexScreener and OpenSea public APIs with the source named beside every figure. Design guidance was adapted from Jakub Krehel's Better Interface (MIT); documentation guidance from Paul Bakaus's Impeccable (Apache-2.0). Their notices and license texts are retained in `artifacts/licenses/`.
