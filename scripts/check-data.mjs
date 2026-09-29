import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { marketCapShares, trackedVolume } from '../src/market/normalize.mjs';
const projects = JSON.parse(readFileSync('src/data/projects.json', 'utf8'));
const snapshot = JSON.parse(readFileSync('src/data/market.json', 'utf8'));
const statuses = ['OFFICIAL IMD', 'INDEPENDENT — VERIFIED', 'INDEPENDENT — SUPPORTS IMD', 'UNVERIFIED', 'FLAGGED'];
const isoStamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const finiteOrNull = (v, label) => assert(v === null || (typeof v === 'number' && Number.isFinite(v)), `${label} must be a finite number or null (no placeholders)`);
assert.equal(projects.length, 4);
assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
for (const p of projects) {
  assert(statuses.includes(p.affiliationStatus));
  assert.match(p.lastReviewed, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(p.color, /^#[0-9a-f]{6}$/, `${p.id} needs a chart/indicator color`);
  const ids = new Set(p.sources.map(s => s.id));
  assert.equal(ids.size, p.sources.length, `Duplicate source id in ${p.id}`);
  for (const item of [...p.overview, p.relationshipToIMD, p.affiliationEvidence, p.provenance, ...p.howItWorks, ...p.securityNotes, ...p.riskFlags, ...p.contracts, { sourceIds: p.descriptionSourceIds }, p.market]) {
    assert(item.sourceIds.length > 0, `Missing source on ${p.id}`);
    for (const id of item.sourceIds) assert(ids.has(id), `Broken source ${p.id}/${id}`);
  }
  for (const c of p.contracts) {
    assert.match(c.address, /^0x[0-9a-fA-F]{40}$/);
    assert(new URL(c.explorer).pathname.toLowerCase().includes(c.address.toLowerCase()));
    assert(c.verification.length > 10);
  }
  for (const link of [...p.links, ...p.sources]) assert.equal(new URL(link.url).protocol, 'https:');
  // Market identification must reuse a contract already listed for the project: no name-based matching.
  assert(['token', 'nft'].includes(p.market.kind));
  assert(p.contracts.some(c => c.address.toLowerCase() === p.market.contractAddress.toLowerCase() && c.chain === p.market.chain), `${p.id} market contract must be one of its listed contracts on the same chain`);
  assert.equal(p.market.chainId, p.market.chain === 'Ethereum' ? 1 : 4663, `${p.id} chain id`);
  const entry = snapshot.entries[p.id];
  assert(entry, `Snapshot entry missing for ${p.id}`);
  assert.equal(entry.contractAddress.toLowerCase(), p.market.contractAddress.toLowerCase(), `${p.id} snapshot contract mismatch`);
  assert.equal(entry.kind, p.market.kind);
  for (const key of ['price', 'marketCap', 'volume24h', 'change24h', 'circulatingSupply', 'liquidityUsd']) finiteOrNull(entry[key], `${p.id}.${key}`);
  assert(entry.marketDataUpdatedAt === null || isoStamp.test(entry.marketDataUpdatedAt), `${p.id} timestamp`);
  assert(entry.marketDataSource?.name && new URL(entry.marketDataSource.url).protocol === 'https:' && new URL(entry.marketDataSource.api).protocol === 'https:');
  if (entry.kind === 'nft') { assert.equal(entry.marketCap, null, 'NFT collections never carry a token market cap'); assert.equal(entry.comparable, false); assert.equal(entry.volume24h, null, 'NFT marketplace volume must not populate the token volume field'); }
  if (entry.marketCap === null) assert.equal(entry.comparable, false, `${p.id} cannot be comparable without a market cap`);
  if (entry.marketCap !== null) { assert(entry.comparable && entry.marketCapMethod, `${p.id} needs a market-cap method`); assert(entry.price !== null && entry.primaryPair, `${p.id} price and primary pair`); }
}
assert.equal(new Set(projects.map(p => p.color)).size, projects.length, 'Chart colors must be distinct per project');
assert(isoStamp.test(snapshot.generatedAt));
// Chart math: shares are computed from the data, N/A entries are excluded from the denominator, and rounded shares sum to ~100%.
const rows = projects.map(p => ({ id: p.id, ...snapshot.entries[p.id] }));
const { total, eligible } = marketCapShares(rows);
assert.equal(eligible.length, rows.filter(r => r.comparable && r.marketCap !== null).length);
assert(!eligible.some(r => r.kind === 'nft'));
assert(Math.abs(eligible.reduce((s, r) => s + r.marketCap, 0) - total) < 1e-6);
for (const r of eligible) assert(Math.abs(r.share - r.marketCap / total) < 1e-12);
const rounded = eligible.reduce((s, r) => s + Math.round(r.share * 1000) / 10, 0);
if (eligible.length) assert(Math.abs(rounded - 100) <= 0.1 * eligible.length, `Rounded shares sum to ${rounded}`);
const volume = trackedVolume(rows);
assert.equal(volume.count, rows.filter(r => r.kind === 'token' && r.volume24h !== null).length);
assert.equal(projects.filter(p => p.affiliationStatus === 'OFFICIAL IMD').length, 0);
assert.equal(projects.filter(p => p.affiliationStatus.startsWith('INDEPENDENT')).length, 3);
assert.equal(projects.find(p => p.id === 'project-hive').affiliationStatus, 'UNVERIFIED');
assert(projects.find(p => p.id === 'project-hive').riskFlags.some(r => r.kind === 'AUTOMATED WARNING'));
console.log(`PASS: 4 listings; valid statuses, addresses, HTTPS links and claim/source references; calculated status counts match. Market snapshot ${snapshot.generatedAt}: ${eligible.length} comparable market caps totalling ${Math.round(total)} USD (rounded shares ${rounded.toFixed(1)}%), ${volume.count} token volumes totalling ${Math.round(volume.total)} USD, ${rows.length - eligible.length} N/A excluded.`);
