# MeshDefend Full GTM OS — Implementation Checklist

**Project:** Full agentic GTM Operating System  
**Current release:** Inbound only; outbound is deferred to a later release  
**Status:** Local authenticated dashboard foundation is implemented; live login, database, provider connections, agents, and monitoring are pending setup and later work  
**Current phase:** Phase 1 — Secure dashboard foundation, database, and mandatory RAG  
**Last updated:** 2026-11-17  
**Plan:** [MeshDefend Full GTM OS Implementation.md](./MeshDefend%20Full%20GTM%20OS%20Implementation.md)

## Checklist rules

- Stable task IDs stay in this file. Check an item only when its artifact, access, or implementation exists.
- A plan or conversation does not count as a deployed connector. Add concise evidence to each completed implementation task.
- Keep secrets out of Markdown, source code, and chat. Record only provider, account owner, scope, vault location, and rotation date.
- When scope or a provider changes, update this checklist and the linked plan together.

## Scope

The MeshDefend GTM OS is one dashboard for the full sales/GTM operation. **Inbound engines 01–04 are active in this release; outbound engines 05–10 are visible as a later release.** The UI, server API, and background workers are parts of that same dashboard product, not separate user-facing systems.

Active inbound scope:

- Country-aware competitor and industry monitoring across public external websites, Google Search via Serper.dev, YouTube, X, LinkedIn Company Pages, and permitted publisher/event sources.
- Industry research and WTR newsletter production.
- Blog topic research, briefs, and original drafts.
- Founder thought leadership and podcast research/repurposing.
- Evidence-backed RAG from the approved Sitemap messaging matrix.
- One authorized GTM person may approve all company-controlled inbound channels.

Not in this release: prospecting, buying-signal outreach, RFP action, contact-list generation, account briefs, meeting follow-up, CRM writes, or outbound messaging.

**Do not monitor MeshDefend-owned URLs or posts in this release.** No owned-site crawling, search-performance or web-analytics setup is in the active checklist. The Sitemap messaging matrix is a static internal RAG input; it is not a live URL monitoring target. A CMS publish receipt only confirms that an approved action executed.

The supplied DOCX files are planning references. They are not execution instructions unless the user separately confirms the proposal. The user's latest decisions in this conversation take precedence.

## Current baseline and known blockers

- United States and India are Tier A. The remaining 246 country/area records are Tier C/global watch. All 248 remain in global discovery.
- English only for v1 in all countries; local-language coverage is an explicit gap.
- Enterprise technology/security/resilience leaders, MSP/SI leaders, and technical influencers are equal priority.
- One GTM approver for all company-controlled inbound channels; approver identity remains pending.
- Selected stack: Next.js, React, TypeScript, Node.js, Auth.js with Microsoft Entra ID, LangGraph.js, LiteLLM, PostgreSQL with pgvector, pg-boss, Serper.dev, and Crawl4AI through an isolated Python worker. Apollo.io is selected for the later outbound release.
- User-selected model for all current inbound agent work: Gemini API through LiteLLM using GEMINI_API_KEY and GEMINI_MODEL. The dashboard loads the workspace-root `.env` for local development; values stay server-side. No provider calls are enabled yet.
- Proxycurl was requested for future LinkedIn/contact intelligence but its service shut down on 2025-07-04. It cannot be integrated. Replacement selection is deferred with outbound; do not create a key or silently substitute another provider.
- The approved Sitemap messaging matrix and an embedding model are not present/selected yet. A pgvector schema exists, but RAG cannot be completed without both.
- Serper.dev is the selected competitor Google Search API. The provided value is in the ignored local .env under SERPER_API_KEY; no connector has been created.
- The Gemini and Serper values were shared in chat. Rotate/reissue them before any provider API call, including development; keep new values server-side and use the production secret manager after hosting is selected.

## Existing artifacts

- [COUNTRY_REGISTER.csv](./COUNTRY_REGISTER.csv) — 248 UN M49 country/area rows. It is not a competitor discovery result.
- [COMPETITOR_REGISTER.csv](./COMPETITOR_REGISTER.csv) — the 13 company blog accounts and A/B source priorities listed in `MD Inbound Engine.docx`; identity and country presence remain unverified.
- [COMPETITOR_SOURCE_REGISTER.csv](./COMPETITOR_SOURCE_REGISTER.csv) — 13 global blog URLs listed in the supplied document; all country links and successful checks remain pending.
- [INFLUENCER_REGISTER.csv](./INFLUENCER_REGISTER.csv) — 13 LinkedIn people accounts, their value/evidence notes from the same document, and manual-review-only access.
- [SEARCH_TOPIC_REGISTER.csv](./SEARCH_TOPIC_REGISTER.csv) — seven English seed topic clusters for the US and India; country fit and intent are unvalidated.
- [dashboard/](./dashboard/) — Next.js/React/TypeScript application, Entra/Auth.js login gate, server role checks, document-sourced company and people views, country-by-country review matrix, read-only register preview, environment-status screen, database migrations, and register import script. It is a local foundation; Entra/PostgreSQL and live sources are not configured.
- [dashboard/meshdefend_dashboard_design_system.md](./dashboard/meshdefend_dashboard_design_system.md) — user-supplied dashboard visual specification applied to the app.

---

## Phase 1 — Secure dashboard foundation, stack, and mandatory RAG

**Goal:** Establish the shared inbound architecture, source rules, and approved message retrieval before agent workflows.

- [x] **P1-01** — Set enterprise leaders, MSP/SI leaders, and technical influencers to equal priority for v1.
- [x] **P1-02** — Created [COUNTRY_REGISTER.csv](./COUNTRY_REGISTER.csv) with 248 UN M49 country/area rows, ISO codes, and global discovery scope.
- [x] **P1-03** — Set the United States and India to Tier A and the remaining 246 country/area rows to Tier C/global watch; all remain in discovery.
- [x] **P1-04** — Recorded the English-only v1 policy and the resulting non-English coverage gap.
- [x] **P1-05** — Documented candidate competitor categories: direct, adjacent, service/channel, substitute, and emerging/local.
- [x] **P1-06** — Recorded the user-selected inbound channels and single-approver policy in the plan.
- [ ] **P1-07** — Finalize the inbound evidence taxonomy, source retention rules, and retrieval filters for approved claims.
- [ ] **P1-08** — Name the single authorized GTM approver and identify their work identity for the audit log.
- [x] **P1-09** — Documented that this one person may approve every company-controlled inbound channel; if unavailable, publication waits.
- [ ] **P1-10** — Approve source terms, privacy, retention, and permitted-use boundaries for each provider and country.
- [x] **P1-11** — Created the source-register schema and added the 13 company blog URLs listed in `MD Inbound Engine.docx`; no country route is verified or monitored.
- [x] **P1-12** — Defined evidence states: confirmed, inferred, unverified, disputed, and rejected.
- [ ] **P1-13** — Approve current product facts, positioning, proof points, prohibited claims, and founder-approved opinions.
- [ ] **P1-14** — Confirm hosting, PostgreSQL service, Teams/review surface, CMS, newsletter ESP, and secret manager owners.
- [x] **P1-15** — Created the Next.js/React/TypeScript dashboard shell and Node.js server-route foundation, using the supplied enterprise design system. Entra and database configuration are still required before team sign-in can work.
- [ ] **P1-16** — Enable PostgreSQL with pgvector and build the required RAG index from the approved Sitemap messaging matrix. Locate/approve the matrix, select an embedding model and vector dimensions, preserve source/version metadata, and verify retrieved claims return citations.
- [ ] **P1-17** — Configure LiteLLM to use Gemini for all current inbound agent roles via GEMINI_API_KEY and GEMINI_MODEL, then confirm the model ID works. Use Gemini 2.5 Flash if available to this project; otherwise choose an active Gemini model.
- [ ] **P1-18** — Rotate/reissue the credentials shared in chat before any provider API call. Move production Gemini and Serper credentials to separate secret-manager entries and set provider/application spend limits. The local .env is development-only, ignored by Git, and must never be committed.
- [ ] **P1-19** — Record the Serper.dev account owner, local development variable, production vault path, budget cap, and data/retention terms. The local variable exists; the connector has not been created.
- [x] **P1-20** — Recorded Apollo.io as the selected company/contact provider for the later outbound release. Do not create a key or connect contact enrichment during the inbound-only release.
- [ ] **P1-21** — Configure Crawl4AI as an isolated Python worker for permitted external public sources and connect it from the Node app. Keep access-bypass/stealth features disabled.
- [ ] **P1-22** — Confirm YouTube Data API and X API access/budget; register LinkedIn Company Page review as manual or explicitly licensed. Do not scrape LinkedIn member profiles.
- [x] **P1-23** — Recorded Proxycurl as unavailable for the later outbound LinkedIn/contact use case because its service shut down. Any replacement decision is deferred with outbound; current inbound Company Page review uses a permitted manual/licensed route.
- [x] **P1-24** — Recorded the current-release exclusion: no monitoring of MeshDefend-owned URLs/posts and no owned-site analytics setup.
- [x] **P1-25** — Recorded Serper.dev as the selected provider for competitor/topic Google Search monitoring in Phase 2/3; this supersedes the earlier in-house Phase 6 assumption.
- [x] **P1-26** — Added the PostgreSQL schema, including pgvector, user roles, competitors, all company-country presence states, source routes, evidence, content versions, approvals, publish receipts, and audit events. The database has not been provisioned or migrated.
- [x] **P1-27** — Added the Microsoft Entra/Auth.js sign-in gate, single-tenant and app-role validation, and database-backed role checks. Tenant values, app-role assignment, bootstrap admin, approver, and PostgreSQL are still required.
- [x] **P1-28** — Added a read-only local dashboard preview using the country, company, source, people, and topic registers, with all company-country pairs shown as unreviewed.
- [x] **P1-29** — Added root `.env.example`, local-development loading of the workspace-root `.env`, and an Admin screen that displays configuration presence without secret values.
- [x] **P1-30** — Added the selected LangGraph.js, PostgreSQL checkpoint, LiteLLM-compatible client, and pg-boss dependencies to the TypeScript application. Agent workflows, checkpoints, and job schedules are not wired yet.
- [ ] **P1-31** — Locate and approve the Sitemap messaging matrix, select an embedding model, import approved chunks to pgvector, and verify citation-bearing retrieval.
- [x] **P1-32** — Reworked the workspace into a table-first operating dashboard; separated the supplied company blog accounts from LinkedIn people accounts and made the country-by-country evidence matrix the primary coverage view. No account or country was added through external research.

**Phase 1 exit evidence:** not met. The dashboard foundation, login checks, schema, and local register preview exist, but Entra/PostgreSQL are not configured, the matrix and embedding model are missing, and no RAG index, provider connection, or live source run exists.

---

## Phase 2 — Competitor, query, and source registry

**Goal:** Establish who and what the inbound system monitors, with evidence and visible gaps.

- [ ] **P2-01** — Enrich the 248 country/area rows with discovery status and market coverage owner; preserve the selected tiers.
- [ ] **P2-02** — Validate the English seed terms in [SEARCH_TOPIC_REGISTER.csv](./SEARCH_TOPIC_REGISTER.csv) for US and India buyer intent; add verified synonyms and keep local-language gaps explicit.
- [x] **P2-03** — Imported 13 candidate companies from the supplied inbound playbook into [COMPETITOR_REGISTER.csv](./COMPETITOR_REGISTER.csv). The source priority hints are not verified country tiers.
- [ ] **P2-04** — Verify the 13 candidates' official identity, domain, product category, and country evidence before treating them as competitors.
- [ ] **P2-05** — Discover additional direct, adjacent, service/channel, substitute, emerging, and local competitors across all countries; record discovery source and confidence.
- [ ] **P2-06** — Build canonical company/brand/product aliases and parent/subsidiary relationships with reviewer-visible merge decisions.
- [ ] **P2-07** — Add competitor-country links only with evidence, reason, checked date, and confidence.
- [ ] **P2-08** — Register permitted website, publisher, YouTube, X, LinkedIn Company Page, event, and search routes for the user-supplied account/topic lists, with collection route and rights note.
- [ ] **P2-09** — Create the Serper.dev query registry for verified competitor names/products and industry topics, including “continuous resilience” and “cyber recovery”; include intent, country, location, language, cadence, cost cap, and known gaps.
- [ ] **P2-10** — Use SERPER_API_KEY from the ignored local .env for a small US/India search pilot; move a rotated production credential into the vault before deployment and record non-secret evidence.
- [ ] **P2-11** — Review Serper.dev terms, accuracy caveat, permitted result storage/display, attribution, country/language coverage, retention, and credit budget before production cadence.
- [ ] **P2-12** — Build the query cadence and snapshot policy. Treat result changes/related queries as observed signals, not search-volume proof or exhaustive “trends.”
- [x] **P2-13** — Recorded Apollo.io as a future outbound provider; defer plan, API, credit, and contact-data review until outbound is authorized. No key or contact enrichment is part of inbound.
- [ ] **P2-14** — Define manual/approved access for YouTube, X, and LinkedIn Company Pages. Do not use Proxycurl; it is unavailable.
- [ ] **P2-15** — Mark each missing/restricted/manual/not-found source explicitly; never show it as monitored.
- [ ] **P2-16** — Create a competitor × country × source-category coverage view with last-success, freshness, source health, and known gaps.
- [ ] **P2-17** — Add a recurring discovery queue for rebrands, new country presence, new products, acquisitions, and new source URLs.
- [x] **P2-18** — Added the country-by-country competitor presence matrix and evidence review form to the dashboard. Database-backed saves are role-checked and audit-logged; they remain unavailable until PostgreSQL and Entra are configured.

**Phase 2 exit evidence:** verified competitor/source records and Serper queries show country, evidence, route, rights, owner, freshness, and gaps. The 13 planning seeds and finite query list are not described as exhaustive.

**Seed-source rule:** use the supplied inbound document and pasted material as the sole source for initial company/person names, listed URLs, source priorities, and monitoring themes. External search is for monitoring those approved seeds; do not add or enrich account identities from outside research without the user's direction.

---

## Phase 3 — Inbound source collection and change detection

**Goal:** Ingest permitted external signals into evidence-linked, deduplicated records using the finalized agent stack.

- [ ] **P3-01** — Implement Node.js source/job endpoints and persist LangGraph.js runs/checkpoints in PostgreSQL.
- [ ] **P3-02** — Define a common source envelope: source ID, canonical URL, publisher, title, published/fetched dates, language, country evidence, content type, permitted excerpt/metadata, rights status, fetch result, and version hash.
- [ ] **P3-03** — Integrate Serper.dev Google result snapshots for approved competitor/topic queries with country/location/language context, credit tracking, and rate limits.
- [ ] **P3-04** — Integrate Crawl4AI for registered external competitor/publisher pages only; respect terms, robots rules, rate limits, and access controls.
- [ ] **P3-05** — Add permitted RSS/API/page adapters for competitor releases, docs, pricing, press, customer stories, event sources, and newsletters.
- [ ] **P3-06** — Add public YouTube channel/video/query metadata via the approved route and track quotas.
- [ ] **P3-07** — Add X public-post monitoring via authorized read access or a licensed route; record scope/coverage gaps.
- [ ] **P3-08** — Add the approved LinkedIn Company Page manual/licensed review route; no automated member-profile collection.
- [ ] **P3-09** — Normalize URLs and entity aliases; deduplicate by canonical URL/source/version; retain merge history.
- [ ] **P3-10** — Extract country evidence and language; do not infer country from language or domain alone.
- [ ] **P3-11** — Save dated change records for material positioning, product, pricing, country, partnership, customer-proof, content-theme, and event changes.
- [ ] **P3-12** — Route all current inbound model work through Gemini via LiteLLM using GEMINI_API_KEY and GEMINI_MODEL; preserve provider/model/version metadata and keep production credentials in the secret manager.
- [ ] **P3-13** — Return source IDs and evidence URLs with every model-derived claim; keep inferred/unverified separate from confirmed facts.
- [ ] **P3-14** — Add timeouts, per-source limits, retry/backoff, stale-source alerts, quota/credit alerts, and provider failure status.

**Phase 3 exit evidence:** repeated runs deduplicate; every material signal has source and country evidence; provider failures and missing sources remain visible; no MeshDefend-owned URL/post monitor runs.

---

## Phase 4 — Inbound editorial agents and approval workflow

**Goal:** Turn verified market evidence and approved RAG content into useful original inbound drafts.

### Shared workflow

- [ ] **P4-01** — Store approved brand/product facts, personas, prohibited claims, founder voice, and editorial guidance as versioned knowledge assets.
- [ ] **P4-02** — Retrieve relevant pgvector chunks with approved status and source/version links; show retrieved evidence in the review card.
- [ ] **P4-03** — Create source-linked opportunity cards with buyer question, country, audience, intent, novelty, evidence, uncertainty, and proposed original angle.
- [ ] **P4-04** — Add structured LangGraph.js workflow states and human interrupts for evidence review, drafting, editing, approval, rejection, and retry.
- [ ] **P4-05** — Store every content edit as a new version and invalidate prior approvals when text, media, CTA, source, or destination changes.
- [ ] **P4-06** — Show exact text/media, evidence, rights notes, intended channel/audience, CTA, and action to the one authorized approver.

### Blog and original content

- [ ] **P4-07** — Build an English buyer-question/topic backlog from Serper results, verified competitor coverage, public industry evidence, and approved buyer research.
- [ ] **P4-08** — Create original blog brief and draft templates with reader question, audience, intent, contribution, outline, evidence, CTA, author, and reviewer.
- [ ] **P4-09** — Require source/factual, originality, technical, and editorial review; cancel or rewrite derivative drafts.
- [ ] **P4-10** — Keep MeshDefend-owned URL indexing, ranking, traffic, and post-engagement monitoring out of this release.

### WTR newsletter

- [ ] **P4-11** — Create weekly permitted-source ingestion, syndication deduplication, editorial selection, fact-check, and issue drafting.
- [ ] **P4-12** — Require consent and unsubscribe evidence, source rights, audience, links, exact issue approval, and send receipt.

### Founder and podcast

- [ ] **P4-13** — Create founder-specific voice and approved-view guidance; route attributed opinions to the named founder for approval.
- [ ] **P4-14** — Build podcast guest research and episode workflow for consent, transcript, quote approval, edits, clips, and cross-channel reuse.
- [ ] **P4-15** — Keep founder personal-account posting manual unless an exact official permission path is approved.

**Phase 4 exit evidence:** one reviewed sample for each active inbound output can be edited, rejected, or approved with version history and evidence; the workflow cannot execute an unapproved or superseded version.

---

## Phase 5 — Controlled inbound publishing and operations

**Goal:** Execute only approved inbound publication actions and make operational failures visible.

- [ ] **P5-01** — Connect the selected CMS with minimum draft/staging permissions.
- [ ] **P5-02** — Enable publish only after backend approval, version/hash match, expiry check, and idempotency are implemented.
- [ ] **P5-03** — Connect the selected newsletter ESP with consent/suppression checks and send approval.
- [ ] **P5-04** — Save approved payload hash, approver, action time, provider response, and execution receipt for each publish/send.
- [ ] **P5-05** — Add failure handling for expired approval, edited payload, duplicate execution, provider timeout, and partial success.
- [ ] **P5-06** — Build an operations view for external-source health, Serper queries/credits, Apollo usage if connected, agent failures, pending approvals, and publishing receipts.
- [ ] **P5-07** — Keep own-site/post performance analytics and monitoring disabled.

**Phase 5 exit evidence:** an approved exact version executes once with an audit receipt; rejected, edited, expired, or superseded content cannot publish or send.

---

## Phase 6 — Global inbound coverage and operating rhythm

**Goal:** Expand external source coverage and improve signal quality without hiding gaps.

- [ ] **P6-01** — Expand source discovery and Serper query coverage across Tier C countries, keeping English-only and local-language gaps visible.
- [ ] **P6-02** — Review country coverage, permissions, provider quotas/credits, retention, and cost before adding sources.
- [ ] **P6-03** — Audit competitor/source rows monthly and record missed sources and material changes.
- [ ] **P6-04** — Review false entity/country matches, duplicate rates, stale sources, low-value alerts, and reviewer corrections.
- [ ] **P6-05** — Update aliases, topic terms, source routes, and prioritization from reviewer feedback.
- [ ] **P6-06** — Rotate/revoke unused credentials and review provider scopes and spend limits.
- [ ] **P6-07** — Set numeric operating targets only after a 30-day source and review baseline.
- [ ] **P6-08** — Keep outbound engine design in the future release plan; do not add outbound agents, CRM writes, contact export, or outreach to current milestones.

**Phase 6 exit evidence:** registered coverage and blind spots are visible by country, source, freshness, and route; owners and review cadence are assigned.

---

## Future outbound roadmap — not active tasks

The following engines are retained for the later outbound release. Their discovery, CRM, and outreach implementation is not part of the current work.

Apollo.io is the selected future company/contact provider. Proxycurl is unavailable and will require a replacement decision if the later LinkedIn intelligence scope still needs it.

| Engine | Future purpose |
|---|---|
| 05 — Cyber incidents via GitLab CVEs | Combine deduplicated CVE/advisory intelligence with verified company incident disclosures. A CVE alone is not proof of a named account incident. |
| 06 — DPA Rip & Replace | Monitor verified replacement/refresh signals; confirm what “DPA” means before defining the signal rules. |
| 07 — Buying signals | Combine public hiring, investment, and transformation signals into an explainable account hypothesis, not a claim of budget or purchase intent. |
| 08 — RFP/RFI | Find public opportunities and assess eligibility, dates, fit, and partner routes. No auto-submission. |
| 09 — Account briefs | Prepare evidence-linked company and meeting context. |
| 10 — Meeting intelligence and CRM preparation | Draft notes, follow-ups, and CRM diffs from consent-compliant meeting records; future writes require exact approval and idempotency. |

## Recurring checklist

- [ ] **RUN-01** — Weekly: review failed/stale external sources and unverified competitor candidates.
- [ ] **RUN-02** — Weekly: review inbound opportunities, evidence, drafts, approvals, and publication receipts.
- [ ] **RUN-03** — Weekly: review Serper credits/coverage, Apollo access if connected, API quota, and agent failures.
- [ ] **RUN-04** — Monthly: sample country/competitor coverage and record discovery misses.
- [ ] **RUN-05** — Monthly: review provider terms, data retention, credentials, and spend caps.
- [ ] **RUN-06** — Quarterly: refresh competitor categories, buyer audiences, topic terms, approved facts, and country priorities.
- [ ] **RUN-07** — Do not create a recurring own-site URL, search-performance, web-analytics, or post-engagement review in this release.

## Change log

- 2026-11-17 — Created phase-wise inbound implementation checklist and global UN M49 country/area register.
- 2026-11-17 — Recorded US/India Tier A, remaining 246 country/area rows Tier C/global watch, English-only v1, equal audience priority, and one-approver model.
- 2026-11-17 — Imported the 13 supplied company blog accounts, their listed global URLs, and 13 LinkedIn people accounts; all remain unverified/manual review only.
- 2026-11-17 — Drafted seven English US/India topic clusters; country fit and intent remain unvalidated.
- 2026-11-17 — Corrected the plan from inbound-only long-term framing to the full GTM OS, then scoped the current build to inbound only per the user's latest direction; outbound engines are deferred.
- 2026-11-17 — Replaced the previous deferred in-house Google Search assumption with the user-selected Serper.dev API for competitor/topic monitoring.
- 2026-11-17 — Removed owned-site URL/post monitoring and analytics setup from the active checklist.
- 2026-11-17 — Set Gemini API via LiteLLM as the model route for all current inbound agent work; recorded that the Gemini and Serper keys pasted in chat must be rotated before use.
- 2026-11-17 — Created a local .env for Gemini and Serper plus a blank .env.example; added .env to .gitignore. The local file is not an application integration and must not be committed.
- 2026-11-17 — Kept Apollo.io for future outbound and recorded Proxycurl as unavailable; the selected dashboard stack is Next.js/React/TypeScript/Node.js, Auth.js/Entra, LangGraph.js, LiteLLM, PostgreSQL with pgvector, pg-boss, Serper.dev, and Crawl4AI as an isolated Python worker.
- 2026-11-17 — Implemented the local dashboard shell, light design system, protected server routes, environment-status view, database schema, register import path, and read-only seed preview. Live auth, database, RAG, and source connections remain unconfigured or incomplete.
- 2026-11-17 — Replaced the generic account cards with source-based company/people tables and moved the per-country review matrix ahead of the country directory; verified a production build.
