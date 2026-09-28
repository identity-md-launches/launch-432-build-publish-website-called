import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import rawProjects from './data/projects.json';
import type { Claim, Contract, Project, Status } from './types';
import './styles.css';

const projects = rawProjects as Project[];
const filters = ['All', 'NFT', 'Token', 'Strategy', 'App', 'Official', 'Independent', 'Unverified', 'Flagged'];
const date = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
const shortAddress = (value: string) => `${value.slice(0, 8)}…${value.slice(-6)}`;
const isWarning = (p: Project) => ['UNVERIFIED', 'FLAGGED'].includes(p.affiliationStatus);

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    external: <><path d="M14 3h7v7m0-7L10 14" /><path d="M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 8V4H4v11h4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" /><path d="m8 12 3 3 5-6" /></>,
    warning: <><path d="m12 3 10 18H2zM12 9v5m0 3v1" /></>,
    file: <><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h8" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.arrow}</svg>;
}

function PixelMark({ variant = 'brand' }: { variant?: string }) {
  const patterns: Record<string, string[]> = {
    brand: ['11011', '11011', '00100', '11011', '11011'],
    'swarm-pepe': ['01110', '11011', '11111', '10101', '01110'],
    tokenworks: ['11111', '00100', '01110', '00100', '11111'],
    'project-hive': ['01010', '11111', '10101', '11111', '01010'],
    nosh: ['11001', '11101', '10101', '10111', '10011'],
  };
  return <span className={`pixel-mark pixel-${variant}`} aria-hidden="true">{(patterns[variant] ?? patterns.brand).flatMap((row, y) => [...row].map((v, x) => <i key={`${x}-${y}`} style={{ opacity: v === '1' ? 1 : 0 }} />))}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge ${status === 'UNVERIFIED' || status === 'FLAGGED' ? 'warning' : 'independent'}`}><span aria-hidden="true">{status === 'UNVERIFIED' ? '◇' : status === 'FLAGGED' ? '!' : '↳'}</span>{status}</span>;
}

function External({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`external ${className}`}>{children}<Icon name="external" size={14} /><span className="sr-only"> (external site, opens in a new tab)</span></a>;
}

function SourcesInline({ project, ids }: { project: Project; ids: string[] }) {
  return <span className="source-refs">{ids.map(id => { const i = project.sources.findIndex(s => s.id === id); return i < 0 ? null : <a key={id} href={`#project/${project.id}/source/${id}`} aria-label={`Source ${i + 1}: ${project.sources[i].title}`}>[{i + 1}]</a>; })}</span>;
}

function Evidence({ project, value }: { project: Project; value: Claim }) {
  return <div className="evidence-claim"><span className={`evidence-kind kind-${value.kind.toLowerCase().replaceAll(' ', '-')}`}>{value.kind}</span><p>{value.text} <SourcesInline project={project} ids={value.sourceIds} /></p></div>;
}

function Address({ contract, full = false, announce }: { contract: Contract; full?: boolean; announce: (s: string) => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(contract.address); setCopied(true); announce(`${contract.label} copied to clipboard.`); }
    catch { announce('Copy unavailable. Select the address text and copy it manually. The full address is in the evidence view.'); }
  }
  return <div className={`address ${full ? 'address-full' : ''}`}><code dir="ltr" title={contract.address}>{full ? contract.address : shortAddress(contract.address)}</code><button type="button" className="icon-button" onClick={copy} aria-label={`Copy ${contract.label} address`} title="Copy address"><Icon name={copied ? 'check' : 'copy'} size={15} /></button>{full && <External href={contract.explorer}>Explorer</External>}</div>;
}

function ProjectLink({ project }: { project: Project }) {
  return <div className="project-outbound">{isWarning(project) && <p className="outbound-warning"><Icon name="warning" size={15} />{project.affiliationStatus === 'FLAGGED' ? 'Flagged project. Review the security concerns before leaving.' : 'Unverified project. Review the evidence before leaving.'}</p>}<External href={project.links[0].url}>{project.links[0].label}</External></div>;
}

function ProjectCard({ project: p, index, announce }: { project: Project; index: number; announce: (s: string) => void }) {
  return <article className={`project-card card-${p.id}`} aria-labelledby={`name-${p.id}`}>
    <div className="card-top"><span className="mono card-index">INDEX / {String(index + 1).padStart(2, '0')}</span><span className="category">{p.category.join(' / ')}</span></div>
    <div className="project-heading"><div className="project-symbol"><PixelMark variant={p.id} /></div><div><h3 id={`name-${p.id}`}>{p.name}</h3><p>{p.subtitle}</p></div></div>
    <StatusBadge status={p.affiliationStatus} />
    <p className="description">{p.description} <SourcesInline project={p} ids={p.descriptionSourceIds} /></p>
    <div className="risk-row" role="group" aria-label="Risk signals">{p.riskFlags.slice(0, 3).map(r => <span key={r.label} className={`risk-badge ${r.label === 'AUTOMATED SECURITY WARNING' ? 'risk-warning' : ''}`}>{r.label}</span>)}{p.riskFlags.length > 3 && <span className="more-risks">+{p.riskFlags.length - 3} in evidence</span>}</div>
    <div className="card-meta"><span className="chain"><span aria-hidden="true">◇</span>{p.chain}</span><Address contract={p.contracts[0]} announce={announce} /></div>
    <div className="card-bottom"><div><span className="reviewed">Reviewed {date(p.lastReviewed)}</span><ProjectLink project={p} /></div><a className="evidence-link" id={`open-${p.id}`} href={`#project/${p.id}`} aria-label={`View evidence for ${p.name} ${p.subtitle}`}>View evidence<Icon name="arrow" /></a></div>
  </article>;
}

function NetworkArt() {
  return <div className="network-art" aria-hidden="true"><div className="art-caption mono">A MAP OF RELATIONSHIPS</div><svg viewBox="0 0 440 280" className="network-lines"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#33443b" /></pattern></defs><rect width="440" height="280" fill="url(#dots)" /><circle cx="220" cy="140" r="102" fill="none" stroke="#33443b" strokeDasharray="3 6" /><path d="M72 70h76l72 70m-130 90h63l67-90m0 0 64-88h84m-148 88 70 82h65" fill="none" stroke="#577b43" strokeDasharray="4 5" /><path d="M205 125h10v10h-10zm20 0h10v10h-10zm-10 10h10v10h-10zm-10 10h10v10h-10zm20 0h10v10h-10z" fill="#c0f879" /></svg><div className="art-node node-one"><span>01</span><PixelMark variant="swarm-pepe" /><small>NFT</small></div><div className="art-node node-two"><span>02</span><PixelMark variant="tokenworks" /><small>STRATEGY</small></div><div className="art-node node-three"><span>03</span><PixelMark variant="project-hive" /><small>APP</small></div><div className="art-node node-four"><span>04</span><PixelMark variant="nosh" /><small>TOKEN</small></div><span className="art-center mono">IMD</span><div className="art-foot mono">SHARED ECOSYSTEM ≠ SHARED ORIGIN</div></div>;
}

const statusDefinitions: [Status, string][] = [
  ['OFFICIAL IMD', 'A primary Identity MD source explicitly establishes the project as official.'],
  ['INDEPENDENT — VERIFIED', 'Project identity and relevant addresses are independently corroborated. This is not an audit or endorsement.'],
  ['INDEPENDENT — SUPPORTS IMD', 'A third-party mechanism interacts with, purchases, uses or supports IMD. Evidence strength is labeled separately.'],
  ['UNVERIFIED', 'Important claims could not be verified. Missing evidence is not evidence of fraud.'],
  ['FLAGGED', 'Specific credible security concerns are identified and sourced. A flag alone is not a finding of fraud.'],
];

function Methodology() {
  return <section id="methodology" className="methodology"><div className="section-heading"><div><p className="eyebrow">THE STANDARD</p><h2>Relationships, backed by evidence.</h2></div><Icon name="shield" size={28} /></div><div className="method-grid"><div><p className="method-intro">A familiar name is a starting point. Follow the contract, read the mechanism, and check who is behind it.</p><p>We prioritize on-chain records and primary IMD sources, then project documentation and explorers. Independent reports add context. Scanner results are labeled automated warnings.</p><a className="text-link" href="./RESEARCH.md" download>Download research notes <Icon name="file" size={16} /></a><a className="text-link" href="./projects.json" download>Download project data <Icon name="file" size={16} /></a></div><div className="status-definitions">{statusDefinitions.map(([status, text]) => <div key={status}><span className="mono">{status}</span><p>{text}</p></div>)}</div></div><div className="evidence-key"><span className="eyebrow">READING THE EVIDENCE</span><p><b>Verified fact</b> · directly observed or corroborated &nbsp; <b>Project claim</b> · stated by the project &nbsp; <b>Third-party claim</b> · reported elsewhere &nbsp; <b>Automated warning</b> · a scanner signal &nbsp; <b>Unknown</b> · unresolved</p></div></section>;
}

function Directory({ announce }: { announce: (s: string) => void }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('index');
  const counts = { Projects: projects.length, Official: projects.filter(p => p.affiliationStatus === 'OFFICIAL IMD').length, Independent: projects.filter(p => p.affiliationStatus.startsWith('INDEPENDENT')).length, Unverified: projects.filter(p => p.affiliationStatus === 'UNVERIFIED').length, Flagged: projects.filter(p => p.affiliationStatus === 'FLAGGED').length };
  const shown = projects.filter(p => {
    const category = filter === 'All' || p.category.includes(filter) || (filter === 'Independent' ? p.affiliationStatus.startsWith('INDEPENDENT') : filter === 'Official' ? p.affiliationStatus === 'OFFICIAL IMD' : p.affiliationStatus === filter.toUpperCase());
    const haystack = [p.name, p.subtitle, p.description, p.chain, ...p.contracts.map(c => c.address)].join(' ').toLowerCase();
    return category && haystack.includes(query.toLowerCase().trim());
  }).sort((a, b) => sort === 'name' ? `${a.name} ${a.subtitle}`.localeCompare(`${b.name} ${b.subtitle}`) : projects.indexOf(a) - projects.indexOf(b));
  function reset() { setQuery(''); setFilter('All'); }
  return <>
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="square-dot" />INDEPENDENT ECOSYSTEM DIRECTORY</p><h1>IMD<span>erivatives</span><span className="title-period">.</span></h1><p className="hero-tagline">Map the ecosystem.<br />Verify the relationship.</p><p className="hero-description">Projects, tokens and experiments orbiting Identity MD.<br className="desktop-break" /> An independent map of what’s connected — and how.</p><div className="hero-actions"><a className="primary-button" href="#directory">Explore the directory<Icon name="arrow" /></a><a className="quiet-link" href="#methodology">How we verify<Icon name="arrow" size={14} /></a></div></div><NetworkArt /><p className="hero-principle"><span className="mono">THE DISTINCTION THAT MATTERS</span><strong>Built around IMD <span>≠</span> built by IMD.</strong></p></section>
    <div className="counters" role="group" aria-label="Directory totals">{Object.entries(counts).map(([name, n]) => <div className={`counter counter-${name.toLowerCase()}`} key={name}><strong>{String(n).padStart(2, '0')}</strong><span>{name}</span></div>)}<div className="counter-note"><span className="mono">CURATED, NOT LIVE</span><span>Evidence reviewed <br />{date(projects.map(p => p.lastReviewed).sort().at(-1)!)}</span></div></div>
    <Disclaimer />
    <section id="directory" className="directory"><div className="section-heading"><div><p className="eyebrow">EXPLORE THE PERIMETER</p><h2>The directory <span className="heading-count">{projects.length}</span></h2></div><span className="read-only"><Icon name="shield" size={15} />Read-only. Research first.</span></div>
      <div className="directory-tools"><div className="search-field"><label className="search-caption" htmlFor="project-search">Search projects, chains or addresses</label><div className="search-label"><Icon name="search" /><input id="project-search" type="search" name="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects, chains or addresses…" autoComplete="off" /></div></div><label className="sort-label">Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="index">Directory order</option><option value="name">Name A–Z</option></select></label></div>
      <div className="filter-row" role="group" aria-label="Filter projects">{filters.map((f, i) => <button className={`filter ${i === 5 ? 'filter-divider' : ''}`} type="button" aria-pressed={filter === f} key={f} onClick={() => setFilter(f)}>{f}{f === 'All' && <span>{projects.length}</span>}</button>)}</div>
      <div className="results-meta"><span role="status" aria-live="polite">Showing {shown.length} of {projects.length} projects{query && ` matching “${query}”`}</span><span>Inclusion ≠ endorsement</span></div>
      <div className="project-grid">{shown.map(p => <ProjectCard key={p.id} project={p} index={projects.indexOf(p)} announce={announce} />)}</div>
      {shown.length === 0 && <div className="empty-state"><Icon name="search" size={30} /><h3>No projects match this view.</h3><p>{filter === 'Official' ? 'No project in this directory has an established official IMD relationship.' : filter === 'Flagged' ? 'No listing currently meets the Flagged classification. Risk signals are shown separately.' : 'Try another name, chain or address, or reset the filters.'}</p><button type="button" className="primary-button" onClick={reset}>Reset filters<Icon name="arrow" /></button></div>}
      <p className="directory-footnote"><Icon name="info" size={16} />A risk signal is a reason to investigate. It is never automatically proof of fraud.</p>
    </section>
    <Methodology />
    <section className="about" id="about"><PixelMark /><div><p className="eyebrow">INDEPENDENT BY DESIGN</p><h2>A clearer view of the ecosystem.</h2><p>IMDerivatives documents relationships, not recommendations. Every listing has a review date, visible evidence and room for uncertainty. This is a static research snapshot; projects and contracts can change.</p></div></section>
  </>;
}

function Disclaimer() { return <aside className="disclaimer" aria-label="Independent resource disclaimer"><Icon name="info" size={21} /><div><p><strong>Independent. Unaffiliated. Evidence first.</strong> IMDerivatives is an independent community resource and is not affiliated with Identity MD. Listed projects may be built by third parties. Inclusion does not imply endorsement by Identity MD. Always verify contracts and links independently.</p><p className="financial-disclaimer">Nothing on this site is financial advice.</p></div></aside>; }

function Detail({ project: p, announce }: { project: Project; announce: (s: string) => void }) {
  return <article className="project-detail"><a className="back-link" href={`#directory/return/${p.id}`}><Icon name="back" />Back to directory</a><header className="detail-header"><div className="detail-title"><div className="project-symbol"><PixelMark variant={p.id} /></div><div><p className="eyebrow">{p.category.join(' / ')} · {p.subtitle}</p><h1 tabIndex={-1} id="detail-title">{p.name}</h1></div></div><StatusBadge status={p.affiliationStatus} /><p>{p.description} <SourcesInline project={p} ids={p.descriptionSourceIds} /></p><div className="detail-meta"><span>{p.chain}</span><span>Last reviewed <time dateTime={p.lastReviewed}>{date(p.lastReviewed)}</time></span></div></header>
    {isWarning(p) && <div className="detail-warning"><Icon name="warning" /><p>{p.affiliationStatus === 'FLAGGED' ? 'Flagged project. Specific security concerns are documented below.' : 'Unverified project. Important claims remain unresolved.'} Review the evidence before following any external project or explorer link.</p></div>}<div className="detail-layout"><div className="detail-content"><section><h2>Overview</h2><h3>What does it do?</h3>{p.overview.map((c, i) => <Evidence key={i} project={p} value={c} />)}<h3>Why is this related to IMD?</h3><Evidence project={p} value={p.relationshipToIMD} /></section><section><h2>Official or independent?</h2><p className="affiliation-answer">{p.affiliationStatus === 'OFFICIAL IMD' ? 'Official relationship established by the cited primary IMD evidence.' : p.affiliationStatus === 'UNVERIFIED' ? 'Important claims remain unverified.' : p.affiliationStatus === 'FLAGGED' ? 'Specific security concerns are documented below. See the affiliation evidence separately.' : 'Independent. An official IMD relationship has not been established.'}</p><h3>Official endorsement evidence</h3><Evidence project={p} value={p.affiliationEvidence} /><h3>Creator & provenance</h3><Evidence project={p} value={p.provenance} /></section><section id="contracts"><h2>Contracts & addresses</h2><p className="section-intro">{p.chainNote}</p>{p.contracts.map(c => <div className="contract-block" key={c.address}><div className="contract-label"><h3>{c.label}</h3><span>{c.chain}</span></div><Address contract={c} full announce={announce} /><p>{c.verification} <SourcesInline project={p} ids={c.sourceIds} /></p></div>)}</section><section><h2>How it works</h2>{p.howItWorks.map((c, i) => <Evidence key={i} project={p} value={c} />)}</section><section><h2>Security / trust assumptions</h2>{p.securityNotes.map((c, i) => <Evidence key={i} project={p} value={c} />)}</section><section><h2>Evidence & sources</h2><p className="section-intro">External sources open in a new tab. A source link is not an endorsement.</p><ol className="source-list">{p.sources.map(s => <li key={s.id} id={`source-${s.id}`} tabIndex={-1}><span className="source-type">{s.type}</span><External href={s.url}>{s.title}</External><p>{s.note}</p></li>)}</ol></section></div><aside className="detail-sidebar"><div className="sidebar-panel"><p className="eyebrow">REVIEW AT A GLANCE</p><h2>Risk signals</h2><p className="sidebar-note">Signals to investigate, not a verdict.</p>{p.riskFlags.map(r => <div className="risk-detail" key={r.label}><span className={`risk-badge ${r.kind === 'AUTOMATED WARNING' ? 'risk-warning' : ''}`}>{r.label}</span><span className="risk-kind">{r.kind}</span><p>{r.explanation} <SourcesInline project={p} ids={r.sourceIds} /></p></div>)}<div className="sidebar-outbound"><span className="eyebrow">LEAVING IMDERIVATIVES</span><ProjectLink project={p} /></div></div><p className="sidebar-note">Read-only research. No wallet connection or transactions on this site.</p></aside></div><Disclaimer /></article>;
}

function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [notice, setNotice] = useState('');
  const previousProject = useRef<string | null>(null);
  useEffect(() => { const listener = () => setHash(window.location.hash); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener); }, []);
  const route = hash.slice(1).split('/');
  const project = route[0] === 'project' ? projects.find(p => p.id === route[1]) : undefined;
  const unknownProject = route[0] === 'project' && !project;
  useEffect(() => {
    document.title = project ? `${project.name} · ${project.subtitle} — IMDerivatives` : 'IMDerivatives — Map the ecosystem. Verify the relationship.';
    const id = project ? route[2] === 'source' ? `source-${route[3]}` : 'detail-title' : route[0] === 'directory' && route[1] === 'return' ? `open-${route[2]}` : route[0];
    const target = id ? document.getElementById(id) : null;
    if (target) { target.scrollIntoView({ block: 'start' }); if (project || route[1] === 'return') target.focus({ preventScroll: true }); }
    else if (project?.id !== previousProject.current) window.scrollTo(0, 0);
    previousProject.current = project?.id ?? null;
    // Hash segments intentionally drive source anchors and focus return.
  }, [hash, project]);
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><a className="brand" href="#" aria-label="IMDerivatives home"><PixelMark /><span>IMDerivatives</span><span className="brand-slash">/</span></a><nav aria-label="Main navigation"><a href="#directory" aria-current={!project && hash.startsWith('#directory') ? 'page' : undefined}>Directory</a><a href="#methodology">Methodology</a><a href="#about">About</a></nav><span className="independent-label"><span className="square-dot" />COMMUNITY RESOURCE</span></header><main id="main" tabIndex={-1}>{project ? <Detail key={project.id} project={project} announce={setNotice} /> : unknownProject ? <section className="empty-state"><h1>Project not found.</h1><p>This project is not in the current directory.</p><a className="primary-button" href="#directory">Browse all projects<Icon name="arrow" /></a></section> : <Directory announce={setNotice} />}</main><footer className="site-footer"><a className="brand" href="#"><PixelMark /><span>IMDerivatives</span></a><span>Built around IMD ≠ built by IMD.</span><span>Independent research · {projects.length} listings</span></footer><div className="copy-notice" role="status" aria-live="polite">{notice && <><Icon name="info" />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss copy notification">×</button></>}</div></>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
