#!/usr/bin/env bash
set -euo pipefail

# Keep all installed packages and package-manager caches outside the repository.
imd_repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
imd_tmp="${TMPDIR:-/tmp}"
imd_stage="$(mktemp -d "$imd_tmp/imderivatives-build.XXXXXX")"
trap 'rm -rf -- "$imd_stage"' EXIT
cd -- "$imd_repo"
cp package.json package-lock.json index.html tsconfig.json vite.config.ts RESEARCH.md "$imd_stage/"
cp -R src public scripts "$imd_stage/"
# The market snapshot (src/data/market.json) is committed; the build never fetches it. Refresh it
# separately with `node scripts/fetch-market.mjs` when you want newer figures.
npm ci --prefix "$imd_stage" --cache "$imd_tmp/imderivatives-npm-cache" --no-fund --no-audit
npm run typecheck --prefix "$imd_stage"
npm run check:data --prefix "$imd_stage"
npm run build --prefix "$imd_stage"
rm -rf -- "$imd_repo/dist"
cp -R "$imd_stage/dist" "$imd_repo/dist"
printf 'Static export ready: %s/dist\n' "$imd_repo"
