// Refresh the market-data snapshot: node scripts/fetch-market.mjs
// Reads each listing's `market` identification block from src/data/projects.json, queries public,
// key-free APIs by contract address, normalises the result with src/market/normalize.mjs and writes
// src/data/market.json. Missing data stays null (rendered as N/A). The production build never runs this;
// it uses the committed, timestamped snapshot, so builds stay reproducible offline.
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeDexscreener, dexscreenerUrl } from '../src/market/normalize.mjs';

const projects = JSON.parse(readFileSync('src/data/projects.json', 'utf8'));
const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const entries = {};
const errors = [];

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'IMDerivatives-snapshot/1.0 (+read-only research directory)' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

for (const p of projects) {
  const m = p.market;
  if (!m) continue;
  const base = { kind: m.kind, chain: m.chain, chainId: m.chainId, contractAddress: m.contractAddress, identifiedBy: m.identifiedBy, comparable: false, snapshotAt: fetchedAt };
  if (m.kind === 'token') {
    const url = dexscreenerUrl(m.dexscreenerChain, m.contractAddress);
    try {
      const metrics = normalizeDexscreener(await getJson(url), { chainSlug: m.dexscreenerChain, address: m.contractAddress }, fetchedAt);
      entries[p.id] = { ...base, ...metrics, comparable: metrics.marketCap !== null, marketDataSource: { name: 'DexScreener', kind: 'DEX aggregator · public API, no key', api: url, url: metrics.primaryPair?.url ?? `https://dexscreener.com/${m.dexscreenerChain}/${m.contractAddress}` }, volumeDefinition: 'Sum of 24h DEX trading volume in USD across DexScreener pairs whose base token is this contract on this chain.', marketCapDefinition: metrics.marketCapMethod === 'derived-fdv' ? 'Derived by DexScreener as price × total supply (fully diluted). No source reports a verified circulating supply, so circulating supply is N/A.' : metrics.marketCapMethod === 'reported' ? 'Reported by DexScreener.' : null, error: null };
    } catch (e) {
      errors.push(`${p.id}: ${e.message}`);
      entries[p.id] = { ...base, status: 'error', price: null, marketCap: null, marketCapMethod: null, volume24h: null, change24h: null, circulatingSupply: null, liquidityUsd: null, pairsCounted: 0, primaryPair: null, marketDataUpdatedAt: null, marketDataSource: { name: 'DexScreener', kind: 'DEX aggregator · public API, no key', api: url, url: `https://dexscreener.com/${m.dexscreenerChain}/${m.contractAddress}` }, volumeDefinition: null, marketCapDefinition: null, error: String(e.message) };
    }
  } else if (m.kind === 'nft') {
    // NFT collections have no comparable token market cap. Only marketplace statistics are recorded,
    // and they are kept out of every token total. Identification: the OpenSea collection record must
    // list the exact contract address; otherwise the stats are discarded.
    const collectionUrl = `https://api.opensea.io/api/v2/collections/${m.openseaCollection}`;
    const statsUrl = `${collectionUrl}/stats`;
    const nft = { floorPrice: null, floorCurrency: null, volume24h: null, volumeCurrency: null, sales24h: null, owners: null, volumeAllTime: null, marketDataUpdatedAt: null };
    let error = null;
    try {
      const collection = await getJson(collectionUrl);
      const contracts = (collection.contracts ?? []).map(c => `${c.chain}:${String(c.address).toLowerCase()}`);
      if (!contracts.includes(`${m.openseaChain}:${m.contractAddress.toLowerCase()}`)) throw new Error(`OpenSea collection ${m.openseaCollection} does not list ${m.contractAddress} on ${m.openseaChain}; got ${contracts.join(', ') || 'none'}`);
      const stats = await getJson(statsUrl);
      const day = (stats.intervals ?? []).find(i => i.interval === 'one_day');
      const n = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);
      Object.assign(nft, { floorPrice: n(stats.total?.floor_price), floorCurrency: stats.total?.floor_price_symbol ?? null, volume24h: n(day?.volume), volumeCurrency: day?.volume_symbol ?? null, sales24h: n(day?.sales), owners: n(stats.total?.num_owners), volumeAllTime: n(stats.total?.volume), marketDataUpdatedAt: fetchedAt });
    } catch (e) { error = String(e.message); errors.push(`${p.id}: ${e.message}`); }
    entries[p.id] = { ...base, status: error ? 'error' : 'ok', price: null, marketCap: null, marketCapMethod: null, volume24h: null, change24h: null, circulatingSupply: null, liquidityUsd: null, pairsCounted: 0, primaryPair: null, marketDataUpdatedAt: nft.marketDataUpdatedAt, comparable: false, nft, marketDataSource: { name: 'OpenSea', kind: 'NFT marketplace · public API, no key', api: statsUrl, url: `https://opensea.io/collection/${m.openseaCollection}` }, volumeDefinition: 'OpenSea marketplace sales volume for the collection over the last day, in ETH. This is NFT marketplace volume, not token DEX volume, and is never added to the 24h tracked volume total.', marketCapDefinition: 'Not applicable. An NFT collection has no comparable token market cap; no value is derived from floor price.', error };
  }
}

const snapshot = { generatedAt: fetchedAt, generator: 'scripts/fetch-market.mjs', note: 'Timestamped snapshot of public market data, identified by contract address. Values are not endorsements, investment quality or proof of safety. Null means N/A: not reliably obtainable.', errors, entries };
writeFileSync('src/data/market.json', JSON.stringify(snapshot, null, 2) + '\n');
for (const [id, e] of Object.entries(entries)) console.log(id.padEnd(14), e.status.padEnd(9), 'price', e.price, 'mcap', e.marketCap, 'vol24h', e.volume24h, 'chg', e.change24h, e.nft ? `nft floor ${e.nft.floorPrice} ${e.nft.floorCurrency} vol ${e.nft.volume24h} ${e.nft.volumeCurrency}` : `pairs ${e.pairsCounted}`);
if (errors.length) { console.error('Snapshot written with errors (rendered as N/A):'); for (const e of errors) console.error(' -', e); }
else console.log(`Snapshot written: src/data/market.json @ ${fetchedAt}`);
