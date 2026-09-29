import type { PrimaryPair } from './market/normalize.mjs';

export type Status = 'OFFICIAL IMD' | 'INDEPENDENT — VERIFIED' | 'INDEPENDENT — SUPPORTS IMD' | 'UNVERIFIED' | 'FLAGGED';
export type EvidenceKind = 'VERIFIED FACT' | 'PROJECT CLAIM' | 'THIRD-PARTY CLAIM' | 'AUTOMATED WARNING' | 'UNKNOWN';
export interface Claim { text: string; kind: EvidenceKind; sourceIds: string[] }
export interface Source { id: string; title: string; url: string; type: string; note: string }
export interface Contract { label: string; address: string; chain: string; explorer: string; verification: string; sourceIds: string[] }

/** How a listing's market data is identified. Matching is by chain + contract address only. */
export type MarketConfig =
  | { kind: 'token'; chain: string; chainId: number; contractAddress: string; identifiedBy: string; dexscreenerChain: string; sourceIds: string[] }
  | { kind: 'nft'; chain: string; chainId: number; contractAddress: string; identifiedBy: string; openseaCollection: string; openseaChain: string; sourceIds: string[] };

export interface Project {
  id: string; name: string; subtitle: string; category: string[]; color: string;
  description: string; descriptionSourceIds: string[]; relationshipToIMD: Claim;
  affiliationStatus: Status; affiliationEvidence: Claim; chain: string; chainNote: string;
  contracts: Contract[]; links: { label: string; url: string }[];
  riskFlags: { label: string; explanation: string; kind: EvidenceKind; sourceIds: string[] }[];
  overview: Claim[]; howItWorks: Claim[]; securityNotes: Claim[]; provenance: Claim;
  market: MarketConfig; sources: Source[]; lastReviewed: string;
}

export interface MarketSource { name: string; kind: string; api: string; url: string }
export interface NftStats { floorPrice: number | null; floorCurrency: string | null; volume24h: number | null; volumeCurrency: string | null; sales24h: number | null; owners: number | null; volumeAllTime: number | null; marketDataUpdatedAt: string | null }

/** One project's market metrics. `null` renders as N/A and is excluded from every total. */
export interface MarketEntry {
  kind: 'token' | 'nft'; chain: string; chainId: number; contractAddress: string; identifiedBy: string;
  comparable: boolean; snapshotAt: string; status: 'ok' | 'no-pairs' | 'error';
  price: number | null; marketCap: number | null; marketCapMethod: 'derived-fdv' | 'reported' | null;
  volume24h: number | null; change24h: number | null; circulatingSupply: number | null; liquidityUsd: number | null;
  pairsCounted: number; primaryPair: PrimaryPair | null; marketDataUpdatedAt: string | null;
  nft?: NftStats; marketDataSource: MarketSource; volumeDefinition: string | null; marketCapDefinition: string | null; error: string | null;
  /** Set in the browser after an opt-in live refresh; snapshot entries omit it. */
  live?: boolean;
}
export interface MarketSnapshot { generatedAt: string; generator: string; note: string; errors: string[]; entries: Record<string, MarketEntry> }
