import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const projects = JSON.parse(readFileSync('src/data/projects.json', 'utf8'));
const statuses = ['OFFICIAL IMD', 'INDEPENDENT — VERIFIED', 'INDEPENDENT — SUPPORTS IMD', 'UNVERIFIED', 'FLAGGED'];
assert.equal(projects.length, 4);
assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
for (const p of projects) {
  assert(statuses.includes(p.affiliationStatus));
  assert.match(p.lastReviewed, /^\d{4}-\d{2}-\d{2}$/);
  const ids = new Set(p.sources.map(s => s.id));
  for (const item of [...p.overview, p.relationshipToIMD, p.affiliationEvidence, p.provenance, ...p.howItWorks, ...p.securityNotes, ...p.riskFlags, ...p.contracts, { sourceIds: p.descriptionSourceIds }]) {
    assert(item.sourceIds.length > 0, `Missing source on ${p.id}`);
    for (const id of item.sourceIds) assert(ids.has(id), `Broken source ${p.id}/${id}`);
  }
  for (const c of p.contracts) {
    assert.match(c.address, /^0x[0-9a-fA-F]{40}$/);
    assert(new URL(c.explorer).pathname.toLowerCase().includes(c.address.toLowerCase()));
    assert(c.verification.length > 10);
  }
  for (const link of [...p.links, ...p.sources]) assert.equal(new URL(link.url).protocol, 'https:');
}
assert.equal(projects.filter(p => p.affiliationStatus === 'OFFICIAL IMD').length, 0);
assert.equal(projects.filter(p => p.affiliationStatus.startsWith('INDEPENDENT')).length, 3);
assert.equal(projects.find(p => p.id === 'project-hive').affiliationStatus, 'UNVERIFIED');
assert(projects.find(p => p.id === 'project-hive').riskFlags.some(r => r.kind === 'AUTOMATED WARNING'));
console.log('PASS: 4 listings; valid statuses, addresses, HTTPS links and claim/source references; calculated status counts match.');
