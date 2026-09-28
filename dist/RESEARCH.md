# IMDerivatives research record

Reviewed 28 September 2026 (UTC). This is a static, bounded research snapshot, not an audit or a live security monitor. No wallet was connected and no transaction was submitted. The structured record, including claim-level citations and exact addresses, is [src/data/projects.json](src/data/projects.json). The export also includes `projects.json`.

## Method and scope

Read project pages, project documentation, the IMD homepage and documentation, indexed on-chain announcements, and relevant marketplace records. Loaded Nosh and Hive in a browser because their initial HTML did not contain the complete rendered state. Read Hive's public configuration and Nosh's registry API. Searched `imd.fun` and `identity.md` for the four project names; no explicit endorsement was returned. Searches and absence from these pages cannot establish universal absence.

`VERIFIED FACT` means a narrow directly observed or corroborated fact, such as what a page identifies. It does not convert the page's economic, custody or security claims into verified contract behavior. Project statements, third-party reports, automated warnings and unknowns are labeled separately. A reported address is not the same as verified source code. None of these listings establishes official IMD affiliation.

Direct Etherscan address fetches returned HTTP 403 for Swarm Pepe and TokenWorks. The Swarm Pepe Etherscan browser visit also returned 403. Ethereum Blockscout address API requests and the Nosh Robinhood Blockscout address API request returned 403. Read-only RPC attempts (`eth_chainId`, `eth_getCode`, `eth_call` for name/symbol/owner) to Ethereum PublicNode and the Robinhood public RPC returned 403. No bytecode verification, transaction receipt validation, owner privilege analysis or audit conclusion is claimed on that basis.

## 01 · SWARM PEPE

**Primary status: INDEPENDENT — VERIFIED.** This status is limited to corroboration of the collection and its address, not source-code or safety verification.

- [OpenSea collection](https://opensea.io/collection/swarm-pepe) and [item #477](https://opensea.io/item/ethereum/0x999ce0ce8c5f7661e0c74a568ffe27ceb9177bdb/477) identify Swarm Pepe, ERC-721 and Ethereum. The item URL matches the supplied contract `0x999ce0ce8c5f7661e0c74a568ffe27ceb9177bdb`.
- The [Memoscan announcement](https://memoscan.io/memo/0x5a579214f4df9d8ec756e98717e86bb3dbc4ed6a4e4fd70e13599ba6d53ffbb2) associates that same address with eligibility for IMD holders and swarm customers. It records sender `0x90738abe9b04622dc0b3d015a3964cc7d1fd1859` on 25 September 2026. Its artwork, mint and reveal mechanism statements remain attributed claims; the transaction input was not independently retrieved.
- The supplied address is corroborated. Whether Etherscan has verified source, who deployed it, admin rights, and audit coverage remain unknown. No claim of a NEW CONTRACT or UNAUDITED status was inferred from those unknowns.
- The evidence supports a community relationship, not an official IMD relationship. Neither an eligible holder group nor an on-chain message to someone associated with IMD establishes endorsement.

## 02 · IMD STRATEGY / TOKENWORKS

**Primary status: INDEPENDENT — SUPPORTS IMD.** The documented mechanism targets Identity MD NFTs; execution of this deployment was not independently replayed.

- The [project listing](https://www.tokenstrategy.com/strategies/0x80271ce20184e38f4afe90d4ca134304d197aca2) identifies IMDStrategy, symbol IMDSTR, Ethereum and Identity MD as the NFT target. Its URL supplies the exact address. The page's ERC-721 label describes the target context and is not used here to assert that the strategy token itself is an NFT.
- [NFT strategy documentation](https://docs.tokenstrategy.com/strategy-types/nft-strategies) describes fee-funded NFT acquisition, resale above acquisition cost, and strategy-token burns funded by sale proceeds. The directory treats the fee allocations and markup as documented platform defaults rather than verified contract parameters.
- **Disagreement:** the listing's sale-proceeds copy refers to distribution to the protocol and liquidity providers; the documentation and [About page](https://www.tokenstrategy.com/about) describe buyback/burn. The About page also describes treatment of unclaimed royalties that differs from the simplified documentation. The implementation-specific behavior is unresolved.
- **Provenance:** TokenWorks supplies the platform, not Identity MD. The [FAQ](https://docs.tokenstrategy.com/faq) says contracts are audited; this review did not locate and validate a report covering this specific deployed address and version. Audit status is unknown. Collection-owner launch language is not accepted as proof that this listing is official.
- Risks include execution dependence on solvers, fee generation and NFT buyers. A token burn or NFT purchase provides no guaranteed return. No exact deployer identity, permission set or current fee schedule was established.

## 03 · PROJECT HIVE

**Primary status: UNVERIFIED.** This is not a fraud finding. Important operational and custody claims remain unresolved.

- [Homepage](https://projecthive.fun/): claims trading fees buy and operate Identity MD seats and earned IMD is distributed to stakers. Its footer explicitly disclaims affiliation with identity.md and the IMD team.
- [Dashboard](https://projecthive.fun/dashboard.html): direct HTTP fetch succeeded. Browser rendering on this review date displayed a seat count, treasury information, a read-only address lookup and a separate staking link. No wallet interaction was performed. The directory intentionally does not reproduce those figures as verified metrics.
- [Public config](https://projecthive.fun/config.js): identifies Robinhood Chain 4663, Ethereum reads, token `0xCdaE63D95D6dd4f89f6e508c77bD4388b4e5C8Ab`, staking `0x4a56860781f90Cd4d9D9883b33c2B9bE94E88695`, splitter `0xCFd95537953236E7885f450F001b00960F496bC2`, and a reported keeper/seat address. These are clearly labeled project-reported addresses, not verified deployments.
- **Disagreement:** the homepage describes contract-protected custody, while the config describes seats held by a keeper with no separate vault. The config also contains a fallback seat count. Neither the dashboard count nor the marketing establishes enforceable custody or actual payouts.
- [Gridinsoft's report](https://es.gridinsoft.com/online-virus-scanner/url/projecthive-fun), dated 28 September 2026, is explicitly automated. It reports a new domain and low reputation, with an adverse classification. This directory neither adopts its fraud label nor treats domain age as independently verified. No malicious transaction analysis was completed. No unrelated Hive-branded project was used as evidence.
- Operator identity, deployment behavior, staking controls, actual NFT custody, agent operation and payout receipts remain unverified. That is why the primary status is UNVERIFIED rather than FLAGGED.

## 04 · IMD STRATEGY / NOSH

**Primary status: INDEPENDENT — SUPPORTS IMD.** Nosh is a separate platform. This is not the similarly named gift-card service at usenosh.com.

- The [rendered coin page](https://www.usenosh.app/coins/0xE749C8Bf545DA0db1aA6664c63c072c96f25acA1) identifies IMDSTRTGY, an Identity MD target, an Airdrop policy, and Robinhood explorer links. It reports creator `0xebC1188F54B8591eb3322b273391a2f4a714dBd4`; the human identity behind it is unknown.
- The [registry API](https://www.usenosh.app/api/registry) lists the `identitymd` vault as `0x1569887005694c0678954f5f529ddf66ba98a0b6`, with `external_: true`. This is a project API observation, not an independent chain read. Its collection identifier is not asserted to be the Ethereum NFT contract.
- [Nosh documentation](https://www.usenosh.app/docs) explains fee routing and holder allocation. The relevant external-vault exception involves off-chain purchases and time-locked withdrawals; keeper-provided holder snapshots are a stated trust assumption. Generic no-withdrawal language must not be applied to external vaults. The footer states the contracts are unaudited until stated otherwise; no superseding audit was found.
- The page reports Ethereum deliveries of NFTs #1171 and #414 and links receipts, including [this #1171 transaction](https://etherscan.io/tx/0xe15cee0d9cea302224edd75c9b8792e4b5c29aeb0eaf131c6bfd6ecca57605ee). Those are follow-up evidence links, not independently confirmed delivery receipts.
- Relevant token, vault, registry and raffle addresses appear in the structured listing with their source and chain. Source-code verification, bytecode correspondence, router version and deployer permissions were not established. Risks include unaudited code, keeper/custody trust, admin intervention, trading liquidity and cross-chain delivery. No official IMD endorsement was established.

## Official relationship review

Primary sources reviewed: [IMD homepage](https://imd.fun/) and [IMD documentation](https://imd.fun/docs/). Text searches of the retrieved docs for TokenWorks, Nosh, Swarm Pepe and Hive returned no explicit references establishing official status. Search-engine results also did not establish it. This review is not exhaustive across historical social posts or all transactions.

The initial calculated totals are four projects, zero official, three independent, one unverified and zero flagged. A warning badge is separate from a primary classification. Future reviews must update the structured data and date, cite any changed evidence, then rebuild the static export. Never convert missing evidence into an allegation.
