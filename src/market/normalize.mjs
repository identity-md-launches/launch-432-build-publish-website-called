// Shared market-data normalisation. Used by scripts/fetch-market.mjs at snapshot time and by the
// browser for the opt-in "Refresh from DexScreener" action, so both paths apply identical rules.
// Rules (documented in RESEARCH.md):
//  - A token is identified only by chain + contract address, never by name or symbol.
//  - Only DexScreener pairs whose baseToken.address equals the listed contract are counted.
//  - Price, 24h change and market cap come from the single most liquid matched pair.
//  - 24h volume is the sum of 24h DEX volume (USD) across all matched pairs on that chain.
//  - DexScreener's marketCap equals its FDV for these tokens; it is recorded as derived
//    (price × total supply), and circulating supply is left null (N/A) because no source reports it.
//  - Anything missing stays null. Nothing is estimated.

export const DEXSCREENER_API = 'https://api.dexscreener.com';

const num = (v) => { const n = typeof v === 'string' ? Number(v) : v; return typeof n === 'number' && Number.isFinite(n) ? n : null; };

/** DexScreener "pools of a token" URL for one chain slug + contract (returns every listed pair, not only the primary one). */
export function dexscreenerUrl(chainSlug, address) { return `${DEXSCREENER_API}/token-pairs/v1/${chainSlug}/${address}`; }

/**
 * Normalise a DexScreener tokens/v1 response for one listed token.
 * @param {unknown} pairsJson raw array returned by the API
 * @param {{ chainSlug: string, address: string }} id
 * @param {string} fetchedAt ISO timestamp of the fetch
 */
export function normalizeDexscreener(pairsJson, id, fetchedAt) {
  const wanted = id.address.toLowerCase();
  const pairs = (Array.isArray(pairsJson) ? pairsJson : []).filter(p => p && p.chainId === id.chainSlug && String(p.baseToken?.address ?? '').toLowerCase() === wanted);
  if (pairs.length === 0) {
    return { status: 'no-pairs', price: null, marketCap: null, marketCapMethod: null, volume24h: null, change24h: null, circulatingSupply: null, liquidityUsd: null, pairsCounted: 0, primaryPair: null, marketDataUpdatedAt: fetchedAt };
  }
  const byLiquidity = [...pairs].sort((a, b) => (num(b.liquidity?.usd) ?? 0) - (num(a.liquidity?.usd) ?? 0));
  const primary = byLiquidity[0];
  const marketCap = num(primary.marketCap);
  const fdv = num(primary.fdv);
  const volume24h = pairs.reduce((sum, p) => { const v = num(p.volume?.h24); return v === null ? sum : (sum ?? 0) + v; }, null);
  const liquidityUsd = pairs.reduce((sum, p) => { const v = num(p.liquidity?.usd); return v === null ? sum : (sum ?? 0) + v; }, null);
  return {
    status: 'ok',
    price: num(primary.priceUsd),
    marketCap,
    marketCapMethod: marketCap === null ? null : (fdv !== null && Math.abs(fdv - marketCap) < 1 ? 'derived-fdv' : 'reported'),
    volume24h: volume24h === null ? null : Math.round(volume24h * 100) / 100,
    change24h: num(primary.priceChange?.h24),
    circulatingSupply: null,
    liquidityUsd: liquidityUsd === null ? null : Math.round(liquidityUsd * 100) / 100,
    pairsCounted: pairs.length,
    primaryPair: { address: String(primary.pairAddress), dex: [primary.dexId, ...(Array.isArray(primary.labels) ? primary.labels : [])].join(' '), quote: String(primary.quoteToken?.symbol ?? '?'), liquidityUsd: num(primary.liquidity?.usd), url: typeof primary.url === 'string' ? primary.url : null, tokenName: String(primary.baseToken?.name ?? ''), tokenSymbol: String(primary.baseToken?.symbol ?? '') },
    marketDataUpdatedAt: fetchedAt,
  };
}

/** Share of each comparable entry in the tracked total. Excludes null market caps from the denominator. */
export function marketCapShares(entries) {
  const eligible = entries.filter(e => e.comparable === true && typeof e.marketCap === 'number' && Number.isFinite(e.marketCap) && e.marketCap > 0);
  const total = eligible.reduce((s, e) => s + e.marketCap, 0);
  return { total, eligible: eligible.map(e => ({ ...e, share: total > 0 ? e.marketCap / total : 0 })) };
}

/** Sum of 24h token DEX volume across entries that report it. NFT marketplace volume is never included. */
export function trackedVolume(entries) {
  const eligible = entries.filter(e => e.kind === 'token' && typeof e.volume24h === 'number' && Number.isFinite(e.volume24h));
  return { total: eligible.reduce((s, e) => s + e.volume24h, 0), count: eligible.length };
}
