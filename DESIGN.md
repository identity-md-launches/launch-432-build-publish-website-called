# IMDerivatives design system

## Overview

An independent research directory for visitors trying to distinguish an IMD relationship from official IMD authorship. The implemented direction is a dark terminal-inspired interface with quiet green surfaces, lime actions, monospace metadata and original pixel symbols. It deliberately presents evidence, unresolved claims and warnings beside the project description.

The home page uses a prominent wordmark, an illustrative relationship diagram, calculated counters, a visible disclaimer, and a searchable two-column directory. Detail views use a readable evidence column and a risk sidebar. The diagram is decorative, not an on-chain graph or live data visualization. Project symbols are abstract identifiers, not official logos.

Source of truth: `src/styles.css`, `src/fonts.css`, `src/main.tsx`, and the structured listings in `src/data/projects.json`. This document describes the final implementation; the appended readability/reflow rules at the end of the stylesheet override earlier compact defaults.

## Colors

Colors are sRGB hex primitives assigned to semantic CSS variables in `src/styles.css:3`.

| Semantic token | Implemented value | Use |
| --- | --- | --- |
| `--bg` | `#0c100f` | Page background |
| `--surface` | `#121815` | Cards, notice, inputs, sidebar |
| `--surface-raised` | `#19201c` | Hover areas and notification |
| `--border` | `#242e27` | Structural separators and card edges |
| `--control-border` | `#69776d` | Search/select boundaries, neutral focusable surfaces |
| `--text` | `#edf2ed` | Headings and main text |
| `--secondary` | `#c8d0ca` | Descriptions, prose and evidence |
| `--muted` | `#9ca99f` | Metadata and supporting copy |
| `--accent`, `--focus` | `#c0f879` | Primary action, focus ring, brand pixels |
| `--accent-soft` | `#1e2b19` | Selected filter background |
| `--warning` | `#f1c27c` | Unverified status and automated warning text |
| `--warning-bg` | `#282218` | Warning notice and badge surfaces |
| `--fact` | `#a7c9cf` | Verified-fact evidence labels |

Primary buttons use dark text on lime fill. Project classifications use text and symbols as well as color. An independent classification is neutral, not a green safety approval. Amber signals uncertainty or risk. Decorative graph lines have their own subdued colors and carry no information essential to the task.

Measured examples: primary text/page 16.89:1; description/card 11.42:1; muted/card 7.36:1; primary-button text/fill 15.45:1; selected-filter text/fill 11.98:1. Control borders were corrected after a measured 2.69:1 result on the input surface; final values are in `artifacts/controls-contrast-final.json`. These measurements are for specific rendered pairs, not a universal accessibility certification.

## Typography

- **Interface and headings:** locally bundled Space Grotesk, then Segoe UI, then sans-serif. The WOFF2 is `src/assets/space-grotesk-latin.woff2`; declared normal weights 300–700 with `font-display: swap`. The browser reported the face loaded. The font's internal axes were not separately inspected. Actual interface weights are 400, 500, 600, and standard bold. Font synthesis is disabled.
- **Metadata and addresses:** SFMono-Regular, Consolas, Liberation Mono, monospace, via `--mono`. No remote font request is made by the app.
- **Wordmark:** responsive clamp, up to 4.6rem, weight 500, line height 1.15, negative tracking. Its normal single-line composition may wrap anywhere when enlarged; it never forces horizontal scrolling.
- **Hero statement:** 24–32px desktop range; 26px at the smallest breakpoint. Section headings are 30px desktop / 27px mobile; card titles 20px / 19px. Detail h1 uses a responsive clamp; h2 24px, h3 16px.
- **Reading text:** card descriptions 15px desktop / 14px mobile, line-height 1.7; evidence prose 15px at 1.75 and maximum 72ch. General body starts at 1rem and 1.6. Disclaimers use 13px desktop / 12px mobile.
- **Compact roles:** status and citation labels 10–11px; addresses 11–12px; category/chain labels 12px. Purely decorative diagram labels are 8–10px. These are dense metadata roles; explanatory paragraphs remain larger.
- Headings use balanced wrapping; short prose uses pretty wrapping. Long addresses in both prose and code can break. Counters use tabular numerals. Input and select text reaches 16px on mobile to avoid focus zoom. Meaningful text remains selectable.

## Layout

Shared header, main and footer have a 1280px maximum border-box width. Inline padding is 48px, then 32px at 68rem, then 20px at 36rem. This yields shared alignment edges for the hero, notice, tools, cards and footer.

Spacing follows 4/8/12/16/24/32/48/64px steps, with explicit component values in CSS and the available `--space-*` scale defined at the root. Typical card padding is 24px; grid gap is 20px; internal metadata gaps are smaller than section gaps. Major home sections use approximately 44–70px of vertical separation.

| Breakpoint | Implemented adaptation |
| --- | --- |
| Above 68rem | Full hero diagram, two cards per row, five counters plus review note |
| At/below 68rem | 32px margins; compact diagram, card spacing and detail sidebar |
| At/below 52rem | Hero becomes one column; decorative diagram hidden; cards become one column; review note spans counters; detail sidebar follows content in DOM order |
| At/below 36rem | 20px margins; navigation wraps to a second line; search and sort stack; filters wrap; counters use three columns; card actions stack; detail address rows wrap |

The detail grid is `minmax(0, 1fr)` plus a 300px sidebar (270px at the intermediate breakpoint), with 64px/32px gaps. It has no sticky overlay. Full contract values wrap and remain copyable. Hash routing needs no server rewrite.

Rendered at 1440×1000, 900×1000, 390×844 and 320×850. All four detail routes and the home page were measured at 320px after fixes without horizontal overflow. A root-font-size 200% stress test also reflowed at 320px. This is not a claim of native browser zoom or physical-device testing.

## Elevation & depth

The interface is mostly flat. Tone separates page, cards and hover surfaces; 1px borders communicate structure. Only the persistent copy notification is elevated (`0 8px 30px #0008`, z-index 10). The skip link uses z-index 20 when focused. No modal, drawer, backdrop, parallax or autoplay is present.

## Shapes

Small badges use 2–3px radii; inputs/actions/contract blocks 4px; notices/sidebar 5px; project cards 6px. Original symbols use a 5×5 grid of squares with 2px gaps. The header mark, card identifiers and graph nodes share this construction. External-link and action icons are inline SVG with a consistent 1.5px stroke, rounded ends and `currentColor`.

## Components

Components are local patterns in `src/main.tsx`, not a separately published component library.

| Component/pattern | Use and behavior |
| --- | --- |
| `ProjectCard` | Name, category, affiliation, sourced description, risks, chain, address, review date and evidence route. Full-card click areas are avoided. |
| `StatusBadge` | One primary status with a textual label and redundant symbol. Unknown/flagged use amber. Detail affiliation and warning copy also distinguish Official, Independent, Unverified and Flagged records. |
| `Evidence` / `SourcesInline` | Evidence-kind label plus attributed prose and numbered source anchors. Citation targets are at least 24×24px. Anchors update the hash, scroll and move focus to the source. |
| `Address` | Abbreviated card value or full detail value. Real copy button with explicit accessible name; explorer link in the detail variant. Success updates a persistent live region; rejected copying explains manual recovery. |
| `External` / `ProjectLink` | External icon, `noopener noreferrer`, new-tab accessible description. Unverified projects show a warning before their project link, with an additional detail warning above contracts. |
| `Directory` controls | Visible search label, native search input and select, pressed-state filter buttons, polite result count, meaningful empty state with Reset filters. Filters and search combine. |
| `Detail` | Shareable `#project/id` view, back link, overview, relationship, provenance, contracts, mechanism, security, risks and sources. Focus enters at h1 and returns to the relevant card on Back. |
| `Disclaimer` | Exact requested independent-resource statement and financial disclaimer; never hidden inside disclosure. |
| `NetworkArt` / `PixelMark` | Local decorative SVG/CSS; hidden from assistive technology; no live-metric implication. |

Hover treatments apply only on hover-capable devices. Native links and buttons remain usable by keyboard. Focus uses a 2px lime perimeter offset 4px; forced-colors mode substitutes system Highlight. Search focuses its wrapper. Primary and copy buttons scale to .96 only when reduced motion is not requested. Background/color/transform transitions last 120ms; no page-load animation is used.

## Do's and don'ts

- Start new directory content with a structured listing and source ids, then reuse the card and evidence components. Use the existing semantic colors and container edges.
- Keep one prominent lime action in a view. Keep status meaning in text, not only hue.
- Preserve the distinction between identifying an address, checking source code and auditing a deployment. Do not turn an unknown into a verification badge.
- Keep full addresses reachable and allow long values to wrap. Preserve citation target size and focus return when changing layouts.
- Keep dependencies, hosted trackers, wallets and transaction flows out of the static site. Use local runtime assets.
- Add another hash view only if needed, using the shared header/footer, a single h1, native navigation, focus handling, and the same evidence patterns. Rebuild and inspect the export at the smallest supported width.

Review coverage, before/after findings and unperformed checks are recorded in `artifacts/validation.md`.
