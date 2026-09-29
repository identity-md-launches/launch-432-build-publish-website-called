import React, { useId, useState } from 'react';
import rawSnapshot from './data/market.json';
import { dexscreenerUrl, marketCapShares, normalizeDexscreener, trackedVolume } from './market/normalize.mjs';
import type { MarketEntry, MarketSnapshot, Project } from './types';

export const snapshot = rawSnapshot as MarketSnapshot;

// ---------- formatting (all values pass through here; null always renders as N/A) ----------
export const NA = 'N/A';
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usdSmall = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 4 });
const plain = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });
export const fmtUsd = (n: number | null) => n === null ? NA : n >= 1000 ? usdWhole.format(n) : n >= 1 ? usdCents.format(n) : usdSmall.format(n);
export const fmtPct = (n: number | null, digits = 1) => n === null ? NA : `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`;
export const fmtShare = (share: number) => `${(share * 100).toFixed(1)}%`;
export const fmtAmount = (n: number | null, unit: string | null) => n === null ? NA : `${plain.format(n)} ${unit ?? ''}`.trim();
export const fmtStamp = (iso: string | null) => iso === null ? NA : `${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(iso))} UTC`;

export type MarketRow = MarketEntry & { id: string; name: string; subtitle: string; color: string };

export function rowsFor(projects: Project[], entries: Record<string, MarketEntry>): MarketRow[] {
  return projects.flatMap(p => { const e = entries[p.id]; return e ? [{ ...e, id: p.id, name: p.name, subtitle: p.subtitle, color: p.color }] : []; });
}

// ---------- opt-in live refresh (public DexScreener API, no key, only on request) ----------
export type LiveState = { phase: 'snapshot' } | { phase: 'loading' } | { phase: 'live'; at: string; failed: string[] } | { phase: 'failed'; message: string };

export async function refreshFromDexscreener(projects: Project[], current: Record<string, MarketEntry>): Promise<{ entries: Record<string, MarketEntry>; failed: string[]; at: string }> {
  const at = new Date().toISOString();
  const tokens = projects.filter(p => p.market.kind === 'token');
  const results = await Promise.allSettled(tokens.map(async p => {
    if (p.market.kind !== 'token') throw new Error('not a token');
    const url = dexscreenerUrl(p.market.dexscreenerChain, p.market.contractAddress);
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const metrics = normalizeDexscreener(await res.json(), { chainSlug: p.market.dexscreenerChain, address: p.market.contractAddress }, at);
    return [p.id, metrics] as const;
  }));
  const entries = { ...current };
  const failed: string[] = [];
  results.forEach((r, i) => {
    const p = tokens[i];
    if (r.status === 'fulfilled') { const [id, m] = r.value; const base = current[id]; if (base) entries[id] = { ...base, ...m, comparable: m.marketCap !== null, live: true, error: null }; }
    else failed.push(p.name === p.subtitle ? p.name : `${p.name} (${p.subtitle})`);
  });
  if (failed.length === tokens.length) throw new Error('Unable to reach DexScreener. Showing the committed snapshot instead.');
  return { entries, failed, at };
}

// ---------- donut ----------
function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(a(start)), y1 = cy + r * Math.sin(a(start)), x2 = cx + r * Math.cos(a(end)), y2 = cy + r * Math.sin(a(end));
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

export function Donut({ rows, total, active, setActive }: { rows: (MarketRow & { share: number })[]; total: number; active: string | null; setActive: (id: string | null) => void }) {
  const titleId = useId();
  const descId = useId();
  const size = 240, cx = 120, cy = 120, r = 96, stroke = 30, gap = rows.length > 1 ? 1.6 : 0;
  let cursor = 0;
  const slices = rows.map(row => { const span = row.share * 360; const slice = { row, start: cursor + gap / 2, end: cursor + span - gap / 2 }; cursor += span; return slice; });
  const summary = rows.map(row => `${row.name} ${row.subtitle}: ${fmtUsd(row.marketCap)}, ${fmtShare(row.share)}`).join('; ');
  return <svg className="donut" viewBox={`0 0 ${size} ${size}`} role="img" aria-labelledby={titleId} aria-describedby={descId} onPointerLeave={() => setActive(null)}>
    <title id={titleId}>Tracked ecosystem market cap {fmtUsd(total)}</title>
    <desc id={descId}>{summary}</desc>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
    {slices.map(({ row, start, end }) => end - start >= 359.9
      ? <circle key={row.id} cx={cx} cy={cy} r={r} fill="none" stroke={row.color} strokeWidth={stroke} className={`slice ${active && active !== row.id ? 'dim' : ''}`} onPointerEnter={() => setActive(row.id)} onClick={() => setActive(active === row.id ? null : row.id)}><title>{`${row.name} ${row.subtitle}: ${fmtUsd(row.marketCap)} (${fmtShare(row.share)})`}</title></circle>
      : <path key={row.id} d={arcPath(cx, cy, r, start, end)} fill="none" stroke={row.color} strokeWidth={active === row.id ? stroke + 6 : stroke} className={`slice ${active && active !== row.id ? 'dim' : ''}`} onPointerEnter={() => setActive(row.id)} onClick={() => setActive(active === row.id ? null : row.id)}><title>{`${row.name} ${row.subtitle}: ${fmtUsd(row.marketCap)} (${fmtShare(row.share)})`}</title></path>)}
    <text x={cx} y={cy - 14} textAnchor="middle" className="donut-label">TRACKED ECOSYSTEM</text>
    <text x={cx} y={cy} textAnchor="middle" className="donut-label">MARKET CAP</text>
    <text x={cx} y={cy + 26} textAnchor="middle" className="donut-total">{fmtUsd(total)}</text>
  </svg>;
}

// ---------- dashboard section ----------
export function MarketDashboard({ projects, entries, live, onRefresh }: { projects: Project[]; entries: Record<string, MarketEntry>; live: LiveState; onRefresh: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const rows = rowsFor(projects, entries);
  const { total, eligible } = marketCapShares(rows);
  const volume = trackedVolume(rows);
  const withData = rows.filter(r => r.kind === 'token' ? r.marketCap !== null || r.price !== null : r.nft?.floorPrice != null || r.nft?.volume24h != null);
  const tokensWithData = rows.filter(r => r.kind === 'token' && (r.marketCap !== null || r.price !== null)).length;
  const nftWithData = withData.length - tokensWithData;
  const selected = eligible.find(r => r.id === active) ?? null;
  const stampOf = (r: MarketRow) => r.marketDataUpdatedAt;
  const latest = rows.map(stampOf).filter((s): s is string => s !== null).sort().at(-1) ?? null;
  const anyLive = rows.some(r => r.live);
  return <section id="market" className="market" aria-labelledby="market-title">
    <div className="section-heading"><div><p className="eyebrow">ECOSYSTEM DASHBOARD</p><h2 id="market-title">Market data, by contract address.</h2></div><span className="read-only"><span className="square-dot" aria-hidden="true" />{anyLive ? 'LIVE · DEXSCREENER' : 'SNAPSHOT · NOT LIVE'}</span></div>
    <div className="market-tiles" role="group" aria-label="Ecosystem market totals">
      <div className="tile"><span className="tile-label">TRACKED MARKET CAP</span><strong>{eligible.length ? fmtUsd(total) : NA}</strong><span className="tile-note">{eligible.length} of {rows.length} projects with comparable data</span></div>
      <div className="tile"><span className="tile-label">24H TRACKED VOLUME</span><strong>{volume.count ? fmtUsd(volume.total) : NA}</strong><span className="tile-note">Token DEX volume only · {volume.count} projects</span></div>
      <div className="tile"><span className="tile-label">PROJECTS TRACKED</span><strong>{String(rows.length).padStart(2, '0')}</strong><span className="tile-note">Every listing, including N/A entries</span></div>
      <div className="tile"><span className="tile-label">MARKET DATA AVAILABLE</span><strong>{String(withData.length).padStart(2, '0')}<span className="tile-of"> / {String(rows.length).padStart(2, '0')}</span></strong><span className="tile-note">{tokensWithData} token{tokensWithData === 1 ? '' : 's'} · {nftWithData} NFT marketplace</span></div>
    </div>
    <div className="market-status">
      <p className="market-stamp"><span className="mono">MARKET DATA UPDATED</span><time dateTime={latest ?? undefined}>{fmtStamp(latest)}</time><span className="mono">{anyLive ? 'LIVE READ · DEXSCREENER PUBLIC API' : `SNAPSHOT · ${snapshot.generator}`}</span></p>
      <div className="market-refresh"><button type="button" className="secondary-button" onClick={onRefresh} disabled={live.phase === 'loading'} aria-describedby="refresh-note">{live.phase === 'loading' ? 'Refreshing…' : 'Refresh from DexScreener'}</button><span id="refresh-note" className="refresh-note">Optional. Sends one request per token to DexScreener; no wallet, no key.</span><p role="status" aria-live="polite" className="refresh-status">{live.phase === 'live' ? `Live values read at ${fmtStamp(live.at)}${live.failed.length ? `. Unable to refresh ${live.failed.join(', ')}; the previously shown values remain for ${live.failed.length === 1 ? 'that project' : 'those projects'}, with ${live.failed.length === 1 ? 'its' : 'their'} own timestamp.` : '.'}` : live.phase === 'failed' ? live.message : ''}</p></div>
    </div>
    <div className="chart-layout">
      <div className="chart-figure">
        {eligible.length ? <Donut rows={eligible} total={total} active={active} setActive={setActive} /> : <div className="empty-state chart-empty"><h3>No comparable market cap available.</h3><p>No listed project currently has verifiable, comparable market-cap data, so there is nothing to chart.</p></div>}
        <p className="chart-readout" role="status" aria-live="polite">{selected ? <><span className="swatch" style={{ background: selected.color }} aria-hidden="true" /><b>{selected.name} · {selected.subtitle}</b> {fmtUsd(selected.marketCap)} · {fmtShare(selected.share)} of tracked total</> : 'Select a slice or a legend item to see its exact value and share.'}</p>
      </div>
      <div className="chart-side">
        <p className="eyebrow">LEGEND · SHARE OF TRACKED TOTAL</p>
        <ul className="legend">{eligible.map(row => <li key={row.id}><button type="button" className={`legend-item ${active === row.id ? 'active' : ''}`} aria-pressed={active === row.id} onClick={() => setActive(active === row.id ? null : row.id)} onPointerEnter={() => setActive(row.id)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(row.id)} onBlur={() => setActive(null)}><span className="swatch" style={{ background: row.color }} aria-hidden="true" /><span className="legend-name">{row.name}<small>{row.subtitle}</small></span><span className="legend-value">{fmtUsd(row.marketCap)}</span><span className="legend-share">{fmtShare(row.share)}</span></button></li>)}</ul>
        {rows.filter(r => !eligible.some(e => e.id === r.id)).map(row => <p key={row.id} className="legend-excluded"><span className="swatch" style={{ background: row.color }} aria-hidden="true" /><span><b>{row.name} · {row.subtitle}</b> — {row.kind === 'nft' ? 'NFT collection: no comparable market cap (N/A). Excluded from the chart and the total.' : 'Market cap N/A. Excluded from the chart and the total.'}</span></p>)}
        <p className="chart-caveat">Chart includes only listed projects for which comparable market-cap data could be verified. It does not represent the total value of the Identity MD ecosystem.</p>
        <p className="chart-caveat">Market cap here is DexScreener’s fully diluted value (price × total supply) for each token’s most liquid pool. 24h tracked volume sums token DEX volume across DexScreener pools; NFT marketplace volume is shown separately on its card and never added. Market data is not endorsement, investment quality or proof that a project is safe. Nothing on this site is financial advice.</p>
      </div>
    </div>
  </section>;
}

// ---------- card + detail sections ----------
function Metric({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: string }) {
  return <div className="metric"><dt>{label}</dt><dd className={tone}>{value}{note && <small>{note}</small>}</dd></div>;
}

export function CardMarket({ entry }: { entry: MarketEntry }) {
  const nft = entry.kind === 'nft';
  return <div className={`card-market ${nft ? 'card-market-nft' : ''}`}>
    <div className="market-head"><span className="eyebrow">{nft ? 'NFT MARKETPLACE DATA · NOT TOKEN DATA' : `TOKEN MARKET DATA · ${entry.live ? 'LIVE' : 'SNAPSHOT'}`}</span><span className="market-source mono">{entry.marketDataSource.name.toUpperCase()}</span></div>
    <dl className="market-grid">
      {nft ? <>
        <Metric label="FLOOR PRICE" value={fmtAmount(entry.nft?.floorPrice ?? null, entry.nft?.floorCurrency ?? null)} note="OpenSea, not a token price" />
        <Metric label="MARKET CAP" value={NA} note="NFT · no comparable value" />
        <Metric label="24H NFT VOLUME" value={fmtAmount(entry.nft?.volume24h ?? null, entry.nft?.volumeCurrency ?? null)} note={entry.nft?.sales24h != null ? `${entry.nft.sales24h} sales · not in tracked total` : 'not in tracked total'} />
        <Metric label="24H CHANGE" value={NA} note="not reported" />
      </> : <>
        <Metric label="PRICE" value={fmtUsd(entry.price)} />
        <Metric label="MARKET CAP" value={fmtUsd(entry.marketCap)} note={entry.marketCapMethod === 'derived-fdv' ? 'fully diluted' : entry.marketCapMethod === 'reported' ? 'reported' : undefined} />
        <Metric label="24H VOLUME" value={fmtUsd(entry.volume24h)} note={entry.volume24h === null ? undefined : `DEX · ${entry.pairsCounted} pool${entry.pairsCounted === 1 ? '' : 's'}`} />
        <Metric label="24H CHANGE" value={fmtPct(entry.change24h)} tone={entry.change24h === null ? undefined : entry.change24h < 0 ? 'down' : 'up'} />
      </>}
    </dl>
    <p className="market-updated"><span className="mono">MARKET DATA UPDATED</span><time dateTime={entry.marketDataUpdatedAt ?? undefined}>{fmtStamp(entry.marketDataUpdatedAt)}</time></p>
  </div>;
}

export function DetailMarket({ project, entry, Sources, External }: { project: Project; entry: MarketEntry; Sources: React.ComponentType<{ project: Project; ids: string[] }>; External: React.ComponentType<{ href: string; children: React.ReactNode }> }) {
  const nft = entry.kind === 'nft';
  return <section id="market-data"><h2>Market data</h2>
    <p className="section-intro">{nft ? 'This is an NFT collection. It has no comparable token market cap, and none is derived from its floor price. OpenSea marketplace figures are shown separately and never added to token totals.' : 'Third-party aggregator figures matched by contract address. They describe recent trading activity only; they are not an endorsement, an audit result or evidence about custody or affiliation.'} <Sources project={project} ids={project.market.sourceIds} /></p>
    <div className="contract-block market-detail">
      <div className="evidence-claim"><span className="evidence-kind kind-third-party-claim">THIRD-PARTY CLAIM</span><p>{entry.live ? 'Live read from DexScreener during this visit.' : 'Committed, timestamped snapshot generated by scripts/fetch-market.mjs.'} Identified by {entry.identifiedBy}. Nothing is estimated: a missing metric is shown as N/A.</p></div>
      <dl className="market-grid market-grid-detail">
        {nft ? <>
          <Metric label="FLOOR PRICE" value={fmtAmount(entry.nft?.floorPrice ?? null, entry.nft?.floorCurrency ?? null)} note="OpenSea collection floor" />
          <Metric label="TOKEN PRICE" value={NA} note="not a fungible token" />
          <Metric label="MARKET CAP" value={NA} note="no comparable value" />
          <Metric label="24H NFT VOLUME" value={fmtAmount(entry.nft?.volume24h ?? null, entry.nft?.volumeCurrency ?? null)} note={entry.nft?.sales24h != null ? `${entry.nft.sales24h} sales` : undefined} />
          <Metric label="24H CHANGE" value={NA} />
          <Metric label="OWNERS" value={entry.nft?.owners != null ? String(entry.nft.owners) : NA} note="OpenSea count" />
          <Metric label="CIRCULATING SUPPLY" value={NA} />
        </> : <>
          <Metric label="PRICE" value={fmtUsd(entry.price)} />
          <Metric label="MARKET CAP" value={fmtUsd(entry.marketCap)} note={entry.marketCapMethod === 'derived-fdv' ? 'derived · fully diluted' : entry.marketCapMethod === 'reported' ? 'reported' : undefined} />
          <Metric label="24H VOLUME" value={fmtUsd(entry.volume24h)} note={`DEX · ${entry.pairsCounted} pool${entry.pairsCounted === 1 ? '' : 's'}`} />
          <Metric label="24H CHANGE" value={fmtPct(entry.change24h)} tone={entry.change24h === null ? undefined : entry.change24h < 0 ? 'down' : 'up'} />
          <Metric label="CIRCULATING SUPPLY" value={entry.circulatingSupply === null ? NA : plain.format(entry.circulatingSupply)} note={entry.circulatingSupply === null ? 'no reliable source' : undefined} />
          <Metric label="POOL LIQUIDITY" value={fmtUsd(entry.liquidityUsd)} note="sum of listed pools" />
        </>}
        <Metric label="CHAIN" value={`${entry.chain} (${entry.chainId})`} />
        <Metric label="SOURCE" value={entry.marketDataSource.name} note={entry.marketDataSource.kind} />
        <Metric label="MARKET DATA UPDATED" value={fmtStamp(entry.marketDataUpdatedAt)} />
      </dl>
      <p><b>Contract used for matching:</b> <code dir="ltr">{entry.contractAddress}</code></p>
      {entry.primaryPair && <p><b>Primary pool:</b> {entry.primaryPair.dex} · {entry.primaryPair.tokenSymbol}/{entry.primaryPair.quote} · liquidity {fmtUsd(entry.primaryPair.liquidityUsd)}. Price, market cap and 24h change come from this pool, the most liquid of {entry.pairsCounted} listed.</p>}
      {entry.marketCapDefinition && <p><b>Market cap:</b> {entry.marketCapDefinition}</p>}
      {entry.volumeDefinition && <p><b>Volume definition:</b> {entry.volumeDefinition}</p>}
      {entry.error && <p><b>Unavailable:</b> {entry.error}</p>}
      <p><External href={entry.marketDataSource.url}>Open on {entry.marketDataSource.name}</External></p>
    </div>
  </section>;
}
