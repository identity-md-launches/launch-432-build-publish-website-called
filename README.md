# IMDerivatives

An independent, read-only directory of projects built around Identity MD. Built around IMD ≠ built by IMD. No wallet, trading, minting, approvals, investment recommendations or live market metrics are included.

The site contains four researched listings, category/status filters, text and address search, sorting, shareable hash routes, claim-level sources, contract copy controls, and warnings before leaving for an unverified project. Counts derive from the project data.

## Deliverables

- Static export: [`dist/index.html`](dist/index.html), with local relative assets.
- Project data: [`src/data/projects.json`](src/data/projects.json); types: [`src/types.ts`](src/types.ts).
- Research and source limitations: [`RESEARCH.md`](RESEARCH.md).
- Implemented design: [`DESIGN.md`](DESIGN.md).
- Worker validation: [`artifacts/validation.md`](artifacts/validation.md).
- Publication state and export fingerprint: [`artifacts/publication.json`](artifacts/publication.json).

## Install and rebuild

Requirements: Node.js 22.12+ and npm. Validated with Node 24.21.0 and npm 11.19.0. React, TypeScript and Vite versions are pinned in the package manifest and lockfile.

The assignment prohibits dependency directories in the repository. This command installs the locked dependencies into a disposable `/tmp` staging directory, checks types and project data, builds, and replaces `dist/` only after success:

```sh
bash scripts/build-isolated.sh
```

It uses `npm ci`, `npm run typecheck`, `npm run check:data`, and `npm run build`. The source, manifests and lockfile stay in this repository; packages and the npm cache remain outside it. Nothing under `test/scratch/` is needed to build.

In a normal development checkout where local dependency installation is allowed, `npm ci` followed by `npm run dev` starts Vite, and `npm run preview` serves the finished export after a build. Never include any `node_modules`, package cache, tool scratch directory or dependency archive in a submission. No ignore file was created or modified by this task.

## Preview the finished website

No frontend dependencies are needed to serve the delivered static export:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/`. Stop with Ctrl+C. This local address is a preview, not a public website. Serve over HTTP(S); opening an ES module app directly with `file://` is not supported. Source links remain useful without a connection, but opening an external evidence site requires the network. No external font or script is required at runtime.

The worker also served the production files under `/preview/` and checked that relative asset URLs and hash routes work there. The tool-managed preview metadata described by the reference was absent, so a temporary static HTTP server was used for browser validation and stopped afterwards.

## Publish

Upload **the contents of `dist/`** to a static host. Do not publish the repository root. No server rewrite or build-on-host is required. `vite.config.ts` uses `base: './'`; all views use hash routes such as `#project/nosh`, so subpath and gateway hosting work. Keep `assets/`, `favicon.svg`, `projects.json`, and `RESEARCH.md` beside `index.html` exactly as exported.

The intended publisher should include the source, package manifest, lockfile, documentation, required assets and full `dist/` in the Git submission. This worker did not commit: the assignment explicitly prohibited touching `.git/`. No remote repository URL, commit identifier, authenticated publishing tool or hosting destination was supplied. Public deployment therefore remains **unconfirmed**. A localhost preview is not publication evidence. `artifacts/publication.json` records this limitation and the SHA-256 fingerprint of the ready export; it does not claim a deployment.

After publication, the publisher should record the actual public URL and commit, load that URL, verify the asset responses and one direct hash route, and compare the exported file hashes. Do not substitute these local worker checks for a public-host check.

## Add or review a listing

Add a record to `src/data/projects.json` following `src/types.ts`. Use a unique id; explicit category array; one allowed primary status; contract addresses with chain, explorer link and verification scope; risk flags with evidence kinds; and dated sources with unique ids. Every prose claim should reference source ids from the same listing. Contract source verification and audit status are separate from address identification.

`npm run check:data` validates expected initial listings, source references, addresses, links and classification totals. When deliberately adding future projects, update its initial-scope assertions as well. Update `RESEARCH.md` and review dates, run the isolated build, and recheck the rendered directory. Counts and filters update from the data; new decorative symbols fall back to the directory mark.

## Actual check results

Production build, TypeScript typecheck and data-integrity checks passed. Browser checks exercised all nine filters, search by contract, no-result recovery, sorting, four detail routes, source anchors, copy success/failure feedback, keyboard navigation and focus return, downloads and unknown-route recovery. Final mobile reflow passed at 320px, including every detail route and a 200% root-font-size stress test. Desktop 1440px, intermediate 900px and mobile 390px were also inspected.

The final axe scans reported no violations in the checked desktop/mobile states. Axe left symbolic-glyph contrast items for manual review; computed foreground/background measurements are recorded. Native browser 200% zoom, a real screen reader, physical mobile devices and browser engines other than the supplied Chromium were not tested. Clipboard write arguments and successful resolution were checked; browser policy denied reading the system clipboard back. Full coverage, fixes, screenshots and remaining limitations are in `artifacts/validation.md`.

## Attribution

Space Grotesk is bundled locally under its SIL Open Font License, retained in `src/assets/OFL.txt` and the production assets. Project symbols are original abstract pixel marks, not official project logos. Design guidance was adapted from Jakub Krehel's Better Interface (MIT); documentation guidance from Paul Bakaus's Impeccable (Apache-2.0). Their notices and license texts are retained in `artifacts/licenses/`.
