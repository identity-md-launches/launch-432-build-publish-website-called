export type Status = 'OFFICIAL IMD' | 'INDEPENDENT — VERIFIED' | 'INDEPENDENT — SUPPORTS IMD' | 'UNVERIFIED' | 'FLAGGED';
export type EvidenceKind = 'VERIFIED FACT' | 'PROJECT CLAIM' | 'THIRD-PARTY CLAIM' | 'AUTOMATED WARNING' | 'UNKNOWN';
export interface Claim { text: string; kind: EvidenceKind; sourceIds: string[] }
export interface Source { id: string; title: string; url: string; type: string; note: string }
export interface Contract { label: string; address: string; chain: string; explorer: string; verification: string; sourceIds: string[] }
export interface Project {
  id: string; name: string; subtitle: string; category: string[];
  description: string; descriptionSourceIds: string[]; relationshipToIMD: Claim;
  affiliationStatus: Status; affiliationEvidence: Claim; chain: string; chainNote: string;
  contracts: Contract[]; links: { label: string; url: string }[];
  riskFlags: { label: string; explanation: string; kind: EvidenceKind; sourceIds: string[] }[];
  overview: Claim[]; howItWorks: Claim[]; securityNotes: Claim[]; provenance: Claim;
  sources: Source[]; lastReviewed: string;
}
