# IMDerivatives design system

## Overview

An independent research directory for visitors trying to distinguish an IMD relationship from official IMD authorship. The implemented direction is a dark terminal-inspired interface with quiet green surfaces, lime actions, monospace metadata and original pixel symbols. It deliberately presents evidence, unresolved claims and warnings beside the project description.

The home page uses a prominent wordmark, an illustrative relationship diagram, calculated counters, a visible disclaimer, an ecosystem market dashboard (four stat tiles, a data-driven donut chart with legend and readout), and a searchable two-column directory. Detail views use a readable evidence column, a market-data section and a risk sidebar. The diagram is decorative, not an on-chain graph. The donut is the one real data visualization; its geometry is computed from `src/data/market.json` at render time. Project symbols are abstract identifiers, not official logos.

Source of truth: `src/styles.css`, `src/fonts.css`, `src/main.tsx`, `src/market.tsx`, the structured listings in `src/data/projects.json` (including each project's `color`) and the market snapshot `src/data/market.json`. This document describes the final implementation; the readability/reflow rules and the market-dashboard block appended at the end of the stylesheet override earlier compact defaults.

## Colors

Colors are sRGB hex primitives assigned to semantic CSS variables in `src/styles.css:3`.

| Semantic token | Implemented value | Use |
| --- | --- | --- |
| `--bg` | `#0c100f` | Page background |
| `--surface` | `#121815` | Cards, tiles, chart panel, notice, inputs, sidebar, secondary button |
| `--surface-raised` | `#19201c` | Hover areas, active legend item, notification |
| `--border` | `#242e27` | Structural separators, card/tile edges, donut track |
| `--control-border` | `#69776d` | Search/select and secondary-button boundaries, active legend border, readout dash |
| `--text` | `#edf2ed` | Headings, metric values, tile numbers, donut total |
| `--secondary` | `#c8d0ca` | Descriptions, prose, tile notes, timestamps, legend values |
| `--muted` | `#9ca99f` | Metadata labels, captions, chart caveats |
| `--accent`, `--focus` | `#c0f879` | Primary action, focus ring, brand pixels, status dot |
| `--accent-soft` | `#1e2b19` | Selected filter background |
| `--warning` | `#f1c27c` | Unverified status, automated warning text, "NFT marketplace data · not token data" label |
| `--warning-bg` | `#282218` | Warning notice and badge surfaces |
| `--fact` | `#a7c9cf` | Verified-fact evidence labels |

**Project identity colors** are data, not stylesheet tokens: each listing's `color` in `src/data/projects.json` is applied inline to its card symbol (`PixelMark color`), its donut slice, its legend swatch and the `--project-color` custom property on the card. Current values: Swarm Pepe `#cdb4f5`, IMD Strategy / TokenWorks `#c0f879`, Project Hive `#f1c27c`, IMD Strategy / Nosh `#8ec5e8`. They are categorical identifiers only; they never encode status, safety or interactivity. Adjacent slices are separated by a 1.6° gap of page/surface background because the light categorical colors contrast with each other only 1.1–1.5:1; the legend, the readout and the SVG `<desc>` carry the same information in text.

Primary buttons use dark text on lime fill; the market refresh action is a neutral bordered secondary button so the view keeps one filled action. Project classifications use text and symbols as well as color. An independent classification is neutral, not a green safety approval. Amber signals uncertainty or risk, including the NFT-marketplace label. 24h change is neutral text with an explicit sign and a small ▲/▼ glyph; no green/red encoding is used.

Measured examples (rendered pairs on the final export): primary text/page 16.89:1; description/card 11.42:1; muted/card 7.36:1; primary-button text/fill 15.45:1; selected-filter text/fill 11.98:1; tile number/tile 15.87:1; tile note/tile 11.42:1; legend share/panel 15.87:1; metric label/card 7.36:1; NFT warning label/card 10.92:1; secondary-button text/fill 14.65:1; legend swatches vs panel 9.68–14.52:1. Every new text role measured 7.36:1 or higher. These measurements are for specific rendered pairs, not a universal accessibility certification.

## Typography

- **Interface and headings:** locally bundled Space Grotesk, then Segoe UI, then sans-serif. The WOFF2 is `src/assets/space-grotesk-latin.woff2`; declared normal weights 300–700 with `font-display: swap`. Actual interface weights are 400, 500, 600, and standard bold. Font synthesis is disabled.
- **Metadata, addresses and numbers:** SFMono-Regular, Consolas, Liberation Mono, monospace, via `--mono`. All market values (tile numbers 28px/22px mobile, donut total 22px, metric values 14–15px, legend values and shares 14px) use `--mono` with `font-variant-numeric: tabular-nums` so refreshed values do not shift layout. No remote font request is made by the app.
- **Wordmark:** responsive clamp, up to 4.6rem, weight 500, line height 1.15, negative tracking.
- **Hero statement:** 24–32px desktop range; 26px at the smallest breakpoint. Section headings, including "Market data, by contract address.", are 30px desktop / 27px mobile; card titles 20px / 19px. Detail h1 uses a responsive clamp; h2 24px (including "Market data"), h3 16px.
- **Reading text:** card descriptions 15px desktop / 14px mobile, line-height 1.7; evidence prose 15px at 1.75 and maximum 72ch; chart caveats 12px at 1.7 and maximum 62ch. General body starts at 1rem and 1.6. Disclaimers use 13px desktop / 12px mobile.
- **Compact roles:** status and citation labels 10–11px; metric and tile labels 10–11px uppercase mono with `.08–.1em` tracking; addresses 11–12px; category/chain labels 12px. Donut center labels are 9px mono inside the SVG and are duplicated by the SVG `<title>`.
- Headings use balanced wrapping; short prose uses pretty wrapping. Long addresses, metric values and the contract line in the market section can break anywhere. Input and select text reaches 16px on mobile to avoid focus zoom. Meaningful text remains selectable.

## Layout

Shared header, main and footer have a 1280px maximum border-box width. Inline padding is 48px, then 32px at 68rem, then 20px at 36rem. This yields shared alignment edges for the hero, counters, notice, market dashboard, tools, cards and footer.

Spacing follows 4/8/12/16/24/32/48/64px steps, with explicit component values in CSS and the available `--space-*` scale defined at the root. Typical card padding is 24px; grid gap is 20px; the chart panel uses 32px padding (24px / 16px at the smaller breakpoints) and a 56px column gap. Home-page order: hero → counters → disclaimer → market dashboard (`#market`) → directory → methodology → about.

| Breakpoint | Implemented adaptation |
| --- | --- |
| Above 68rem | Full hero diagram; four market tiles in one row; chart panel two columns (donut ≤340px beside legend); two cards per row; card market grid four metrics across |
| At/below 68rem | 32px margins; market tiles 2×2; chart panel one column with the donut above the legend; compact diagram, card spacing and detail sidebar |
| At/below 52rem | Hero one column; diagram hidden; refresh control left-aligned under the timestamp; card market grid 2×2; cards one column; detail sidebar follows content |
| At/below 36rem | 20px margins; navigation wraps; tiles stay 2×2 with 22px numbers; donut ≤260px; legend items stack value under name; detail market grid 2 columns; card actions stack |

The detail grid is `minmax(0, 1fr)` plus a 300px sidebar (270px at the intermediate breakpoint). Rendered at 1440×1000, 900×1000, 390×844 and 320×850 on the final export: no horizontal overflow at 320px on the home page (`scrollWidth` 320, zero elements past the edge). This is not a claim of native browser zoom or physical-device testing.

## Elevation & depth

The interface is mostly flat. Tone separates page, cards, tiles and the chart panel; 1px borders communicate structure. The readout under the donut uses a dashed `--control-border` outline to read as a status area rather than a control. Only the persistent copy notification is elevated (`0 8px 30px #0008`, z-index 10). The skip link uses z-index 20 when focused. No modal, drawer, backdrop, parallax or autoplay is present.

## Shapes

Small badges and swatches use 2–3px radii; inputs/actions/tiles/contract blocks 4–5px; the chart panel and project cards 6px. Original symbols use a 5×5 grid of squares with 2px gaps. The donut is a 240-unit SVG viewBox with a 96-unit radius and 30-unit stroke (36 when a slice is active); a single-project chart renders a full circle. External-link, action and status icons are inline SVG with a consistent 1.5px stroke, rounded ends and `currentColor`.

## Components

Components are local patterns in `src/main.tsx` and `src/market.tsx`, not a separately published component library.

| Component/pattern | Use and behavior |
| --- | --- |
| `ProjectCard` (`main.tsx`) | Name, category, affiliation, sourced description, risks, compact `CardMarket` block, chain, address, review date and evidence route. Symbol color comes from the listing's `color`. |
| `CardMarket` (`market.tsx`) | Four-metric `<dl>` (PRICE, MARKET CAP, 24H VOLUME, 24H CHANGE for tokens; FLOOR PRICE, MARKET CAP N/A, 24H NFT VOLUME, 24H CHANGE N/A for NFTs), header label "TOKEN MARKET DATA · SNAPSHOT/LIVE" or "NFT MARKETPLACE DATA · NOT TOKEN DATA", source name and a "MARKET DATA UPDATED" `<time>`. Null always renders `N/A`. |
| `MarketDashboard` (`market.tsx`) | Section `#market` with heading, snapshot/live badge, four `.tile`s (values from `marketCapShares` / `trackedVolume` in `src/market/normalize.mjs`), timestamp row, refresh control with `aria-describedby` note and a polite `role="status"` line, `Donut`, readout, legend and the two mandatory caveats. |
| `Donut` (`market.tsx`) | `role="img"` SVG with `<title>` (total) and `<desc>` (every slice's value and share). Slices are `<path>` arcs (or a `<circle>` for a lone project) with per-slice `<title>`, pointer enter/click handlers and a `.dim` class for the non-active slices. Center text has `pointer-events: none`. |
| Legend (`market.tsx`) | Native `<button aria-pressed>` per eligible project in a `<ul>`: swatch, name + subtitle, value, share. Hover, focus and click set the same active state as the slices, so the pointer interaction has a keyboard path. Excluded projects are listed after it with their swatch and the reason. |
| `DetailMarket` (`market.tsx`) | `#market-data` section between contracts and mechanism: THIRD-PARTY CLAIM label, full metric grid (adds circulating supply, pool liquidity, chain, source, timestamp), contract used for matching, primary pool, market-cap and volume definitions, error text if any, and an `External` link to the source. |
| `.secondary-button` | Neutral bordered action (44px min height) for the opt-in refresh; shows "Refreshing…" and is natively disabled while a request is in flight. |
| `StatusBadge`, `Evidence` / `SourcesInline`, `Address`, `External` / `ProjectLink`, `Directory` controls, `Detail`, `Disclaimer`, `NetworkArt` / `PixelMark` | Unchanged from the previous release: textual status with redundant symbol; evidence-kind labels with 24px citation targets; copy button with live-region feedback; external links with `noopener noreferrer` and hidden new-tab text; labeled search, native select, pressed-state filters, empty state with reset; hash-routed detail with focus management; the exact independence and financial disclaimers; decorative art hidden from assistive technology. |

Hover treatments apply only on hover-capable devices. Native links and buttons remain usable by keyboard. Focus uses a 2px lime perimeter offset 4px; forced-colors mode substitutes system Highlight, draws every slice in `CanvasText` with a dashed pattern for dimmed slices, and outlines swatches. Slice opacity/stroke transitions last 120ms and are disabled under `prefers-reduced-motion: reduce`; button scale-on-press applies only when motion is not reduced. No page-load animation is used.

## Do's and don'ts

- Start new directory content with a structured listing, a distinct `color`, source ids and a `market` identification block keyed by an already-listed contract, then reuse the card, evidence and market components. Use the existing semantic colors and container edges.
- Keep one prominent lime action in a view; use `.secondary-button` for optional or network-touching actions such as refresh. Keep status meaning in text, not only hue, and never color a price change green or red.
- Preserve the distinction between identifying an address, checking source code, auditing a deployment and observing market activity. Do not turn an unknown into a verification badge, and do not derive a market cap for an NFT or from thin data; render `N/A` and leave it out of the totals.
- Compute chart shares and totals from the data through `marketCapShares` / `trackedVolume`; never hard-code a percentage or a dollar figure into markup.
- Keep full addresses reachable and allow long values to wrap. Preserve citation target size, the legend's keyboard path and focus return when changing layouts.
- Keep dependencies, hosted trackers, wallets and transaction flows out of the static site. The only network call is the user-initiated refresh to DexScreener's public API. Use local runtime assets.
- Add another hash view only if needed, using the shared header/footer, a single h1, native navigation, focus handling, and the same evidence patterns. Rebuild and inspect the export at the smallest supported width; hard-reload the preview, because `index.html` can be cached across builds.

Review coverage, before/after findings and unperformed checks are recorded in `artifacts/validation.md`.
