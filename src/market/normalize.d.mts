export const DEXSCREENER_API: string;
export function dexscreenerUrl(chainSlug: string, address: string): string;
export interface PrimaryPair { address: string; dex: string; quote: string; liquidityUsd: number | null; url: string | null; tokenName: string; tokenSymbol: string }
export interface TokenMetrics {
  status: 'ok' | 'no-pairs';
  price: number | null; marketCap: number | null; marketCapMethod: 'derived-fdv' | 'reported' | null;
  volume24h: number | null; change24h: number | null; circulatingSupply: number | null; liquidityUsd: number | null;
  pairsCounted: number; primaryPair: PrimaryPair | null; marketDataUpdatedAt: string;
}
export function normalizeDexscreener(pairsJson: unknown, id: { chainSlug: string; address: string }, fetchedAt: string): TokenMetrics;
export function marketCapShares<T extends { comparable: boolean; marketCap: number | null }>(entries: T[]): { total: number; eligible: (T & { share: number })[] };
export function trackedVolume(entries: { kind: string; volume24h: number | null }[]): { total: number; count: number };
