# MeshDefend Full GTM OS Implementation

**Release now:** Inbound only. **Long-term system:** a full agentic GTM OS with inbound and outbound engines.  
**Status:** Authenticated dashboard foundation is implemented locally; production login, database, provider connections, agents, and monitoring still need configuration and implementation.  
**Last updated:** 2026-11-17  
**Checklist:** [TASK.md](./TASK.md)

## 1. Purpose, scope, and operating boundary

MeshDefend is building one authenticated dashboard as the operating surface for a stateful, human-controlled GTM operating system. The current build is the inbound release: monitor competitor and industry signals, turn verified evidence into original inbound content proposals, and support approved publishing workflows. Outbound is a later release and is listed in the roadmap only; no outbound collection, prospecting, CRM writes, or outreach is in the active phases.

Inbound release capabilities:

1. Competitor and market signal discovery by country across public company websites, Google Search results through Serper.dev, public YouTube, X, LinkedIn Company Pages, publisher feeds, events, and permitted industry sources.
2. Industry newsletter research and original WTR newsletter drafting.
3. Blog research and original SEO/GEO briefs and drafts.
4. Founder thought leadership and podcast research/repurposing, with the relevant person approving their own attributed opinions.
5. A shared evidence store, retrieval system, source health view, and one authorized GTM approver for all company-controlled inbound publishing decisions.

**Not in this release:** outbound prospecting and outreach, sales buying-signal workflows, RFP actions, contact list generation, account briefs, meeting intelligence, CRM writes, and monitoring MeshDefend-owned URLs or posts. Do not set up owned-site search or web analytics. CMS receipts may be saved to prove an approved publish action happened; they are execution records, not a monitoring or performance analytics system.

The approved Sitemap messaging matrix is an internal knowledge input for RAG. Its content may be loaded as a versioned, read-only snapshot after its location and owner are confirmed. This is not permission to crawl or monitor MeshDefend's live website.

The supplied DOCX files and pasted material are data references, not automatic execution instructions. The user's explicit decisions govern scope and priorities. Use them as the sole source for initial company/person names, listed URLs, source priorities, and monitoring themes; do not supplement these details through outside research unless the user asks. The 13 company blog accounts in section 2.1 are the user's initial competitor watchlist, not verified identities or proof of country presence. Their A/B labels are editorial source priority, not country tier. The 13 LinkedIn people accounts are a separate manual-review list.

## 2. User decisions and current baseline

- **Market depth:** United States and India are Tier A; all other 246 UN M49 country/area rows are Tier C/global watch. All 248 rows remain in discovery.
- **Language:** English only for v1 in every country. This knowingly misses local-language competitors and terms; show those gaps.
- **Audience:** Enterprise technology/security/resilience leaders, MSP/SI leaders, and technical influencers have equal priority for v1.
- **Approvals:** One authorized MeshDefend GTM person may approve all company-controlled inbound channels. The person's identity and account access are still needed. No fallback may auto-approve.
- **Google Search:** Serper.dev is the selected Google SERP API for competitor and industry-topic monitoring in Phase 2/3. It replaces the previous deferred in-house search assumption. Do not scrape Google directly.
- **Current channel scope:** competitor websites, YouTube, X, LinkedIn Company Pages, Serper.dev Google results, and permitted publisher/event sources. Platform-specific availability and country coverage must be visible.
- **Outbound:** later release, not current implementation work.
- **No own-site monitoring:** no tasks for MeshDefend URL/post crawling, search performance, or web analytics in this release.

The country register at [COUNTRY_REGISTER.csv](./COUNTRY_REGISTER.csv) has 248 country/area records. [COMPETITOR_REGISTER.csv](./COMPETITOR_REGISTER.csv) contains the 13 company blog accounts, source priorities, and monitoring themes listed in the supplied inbound document. [COMPETITOR_SOURCE_REGISTER.csv](./COMPETITOR_SOURCE_REGISTER.csv) contains their 13 listed global blog URLs; no country route has been checked or marked monitored. [INFLUENCER_REGISTER.csv](./INFLUENCER_REGISTER.csv) contains 13 separate LinkedIn people accounts with the source's notes and manual-review-only route. The initial topic seeds are in [SEARCH_TOPIC_REGISTER.csv](./SEARCH_TOPIC_REGISTER.csv) and remain unvalidated.

## 3. Finalized architecture

| Layer | Selected component | Responsibility in the inbound release |
|---|---|---|
| Application and API | Next.js, React, TypeScript, Node.js | The authenticated team dashboard and its server-side API routes are the product surface for the full GTM OS. No separate service dashboard. |
| Login and roles | Microsoft Entra ID with Auth.js | Single-tenant sign-in; protected reads and actions are checked server-side against database roles. No public signup. |
| Agent orchestration | LangGraph.js | Stateful multi-agent workflows with resumable runs, bounded retries, human review interrupts, and saved checkpoints. |
| LLM gateway | LiteLLM | Central provider routing, credentials, model aliases, spend limits, and usage logs. |
| Current inbound model | Gemini API for all agent roles, as now requested | Route research filtering, classification, summaries, briefs, and copywriting through LiteLLM using GEMINI_API_KEY and GEMINI_MODEL. Use Gemini 2.5 Flash if this project has access; otherwise select an active Gemini model. No Claude route in this release. |
| Source of truth and vector search | PostgreSQL with pgvector | Relational workflow state, source/evidence audit history, and mandatory semantic retrieval over the approved Sitemap messaging matrix. Do not add a separate vector database. |
| Search results | Serper.dev API | Country/language-scoped Google result snapshots for competitors and topics such as “continuous resilience” and “cyber recovery.” |
| B2B firmographic/contact data | Apollo.io | Selected for future outbound company/person lookup and enrichment; it is not an exhaustive company registry and does not grant LinkedIn scraping rights. No Apollo integration or key is part of the inbound release. |
| LinkedIn intelligence | Proxycurl was requested | Proxycurl shut down on 2025-07-04. It cannot be integrated or issued a new key. For current inbound Page monitoring use manual review or an explicitly permitted route. Any future outbound replacement requires a separate decision. |
| Public web extraction | Crawl4AI worker | Keep the Python crawler isolated behind a worker endpoint called by the Node application for registered external public sources. Pin a version; do not bypass access controls, logins, paywalls, challenges, source terms, or rate limits. |
| Background work | pg-boss on PostgreSQL | Run scheduled collection and retries outside interactive dashboard requests; surface run status in the dashboard. |
| Environment settings | Workspace-root `.env` in local development; hosting secret manager in production | Values stay server-side. Admin shows whether configuration exists, without displaying values or claiming connectivity. |
| Human approval | Authenticated review API; Teams is a candidate surface | Teams notification may open the review UI, but the backend verifies the approver, exact version, decision, expiry, and action. Confirm the tenant and workflow owner. |
| Content execution | CMS and newsletter ESP | Provider and scopes remain to be confirmed. Start draft-first; publish/send only after exact-version approval. |

The Gemini provider choice is recorded. Local values are loaded server-side from the ignored workspace-root `.env` during development and must not be committed. Because those values were shared in chat, rotate/reissue them before any provider API call. The specific active model ID must be confirmed against the project before agent implementation; put production credentials in the secret manager. The embedding model for pgvector is separate, has not been selected, and must be decided before vector records are created.

### 3.1 Agent boundaries

A LangGraph.js run may discover, fetch, normalize, resolve entities, check evidence, score relevance, and draft a proposal. Each step stores inputs, outputs, source IDs, timestamps, model/provider, and state. Retry only transient failures, keep each agent's tool set narrow, and stop at review when identity, country, source rights, or factual confidence is uncertain.

The LLM cannot set approval state, alter source rights, obtain secrets, or execute publishing. Deterministic Node server routes validate the designated approver decision against the exact content version before an execution job can publish or send. An edit creates a new version and cancels the old approval. Use an idempotency key and save a receipt for every approved external action.

### 3.2 PostgreSQL and pgvector

PostgreSQL remains the canonical store. Enable the pgvector extension in Phase 1 and store message chunks and their embedding vectors alongside their source/version/approval metadata. Do not copy secret values, private personal data, or unapproved claims into the RAG corpus.

Minimum entities:

- organizations, competitor aliases, country relationships, sources, source permissions, queries, and source health;
- observations, evidence, claims, topic clusters, and country relevance;
- approved Sitemap messaging matrix versions, message chunks, embedding model/version, and retrieval metadata;
- agent runs/checkpoints, content opportunities, briefs, drafts, versions, approval requests, audit events, and execution receipts.

RAG ingestion sequence:

1. Identify and approve the actual Sitemap messaging matrix file/location and owner.
2. Remove secrets and material that should not be available to every agent; record an immutable source version and content hash.
3. Chunk by message, product capability, audience, approved proof, and prohibited claim, preserving headings and source IDs.
4. Select an embedding model, record dimensions and model/version, then persist vectors in pgvector. Model/version changes require a re-embedding plan.
5. Retrieve by semantic similarity plus metadata filters for audience, channel, country, approval state, and product/version.
6. Return the source chunk and link with every retrieved claim so a reviewer can trace the draft back to approved material.

The matrix is not present among the files currently available in this workspace. RAG implementation is therefore a Phase 1 dependency, not a completed build.

## 4. Country-aware monitoring design

### 4.1 Country and competitor identity

Keep the 248-row country register; do not represent it as a competitor directory. A company begins as a candidate and is promoted only after the official identity/domain, category, and country relationship have evidence. Store parent companies, brands, products, aliases, subsidiaries, official URLs, country evidence, confidence, checked date, and reviewer.

Use these candidate categories:

1. Direct: cyber recovery orchestration, recovery validation, or business-service recovery readiness.
2. Adjacent: backup/DR, BCDR, cyber resilience, identity recovery, clean-room recovery, infrastructure recovery, and resilience testing.
3. Service/channel: MSP, MSSP, SI, consulting, and managed recovery offers.
4. Substitute: internal tools, cloud-native recovery, incident response, consulting, or manual processes competing for the same budget.
5. Emerging/local: new entrants, local vendors, rebrands, acquisitions, local subsidiaries, and new country launches.

An “every competitor” claim cannot be proven. The system instead reports discovered entities and the country/source categories where evidence is fresh, stale, manual, blocked, or not found.

### 4.2 What to monitor

For each verified competitor and country relationship, discover and register relevant sources for:

- Positioning, category, buyer, promises, differentiators, proof, and claims.
- Product launches, features, integrations, documentation, support lifecycle, and release notes.
- Pricing, trials, packaging, managed services, public terms, and regional availability.
- Customers, certifications, case studies, public references, partnerships, acquisitions, and launches.
- Content, press, newsletters, webinars, podcasts, events, videos, and public social updates.
- Country-specific partner/customer activity and public procurement opportunities only as market context; outbound RFP response is deferred.
- Search result presence and changes for approved competitor and topic queries.
- Public reputation or community discussion only when collection and reuse are permitted.

Store observations as dated events with source URL, title, publisher, timestamp, country evidence, collection route, permitted short excerpt/metadata, rights note, and prior-version link. An unavailable source remains a visible gap.

### 4.3 Source routes

| Surface | Inbound use | Collection route and limit |
|---|---|---|
| Competitor websites | Product, pricing, integrations, docs, changelogs, press, customer stories, and regional pages | Crawl4AI on registered external URLs where permitted; check terms and robots rules, rate-limit, and retain minimum necessary metadata/evidence. No own-site crawl in this release. |
| Google Search | Competitor brands/products, market terms, “continuous resilience,” “cyber recovery,” and validated synonyms | Serper.dev API; store query, country/location, language, device if supported, result URL/title/position, timestamp, and provider. The provider returns search results, not guaranteed search-volume data. |
| YouTube | Public competitor videos/channels and selected searches | YouTube Data API for public metadata/search or a permitted provider. Competitor private analytics are unavailable. Respect quotas. |
| X | Public competitor posts and approved topic searches | X API read endpoints if available within access and budget, otherwise manual or licensed provider. Recheck endpoint access and usage cost at setup. |
| LinkedIn | Company Page URLs and material public updates | Manual review or a licensed route with explicit Page-data rights. Do not scrape member profiles or automate LinkedIn browsing. Proxycurl is shut down. |
| Publisher/newsletter sources | Industry reading and original WTR research | RSS, permitted public pages, and newsletters to which MeshDefend subscribes and may process. Do not copy long passages or gated content. |
| Events | Industry events, speakers, sponsors, and public recaps | Official organizer pages and permitted public posts. Event attendee status requires evidence; a commenter is not an attendee. |

### 4.4 Serper query and trend design

Maintain a versioned query registry instead of letting agents generate unlimited search traffic. A query record includes query text, intent, competitor/topic, ISO country, location, language, result type, cadence, owner, cost cap, retention rule, last run, and known gaps.

Initial topic seeds include “continuous resilience” and “cyber recovery,” alongside the seven unvalidated clusters in SEARCH_TOPIC_REGISTER.csv. Add a query only after checking whether it has a clear monitoring purpose and country fit. Start the paid/credit pilot in the United States and India, then expand to Tier C with a broad global-watch cadence and visible coverage gaps.

Use “trend” narrowly: compare repeated query snapshots, result URLs/positions, result features, and related-query suggestions when returned. Serper's standard search response is not a search-volume measure. Do not describe result movement or a related-search list as proof of demand. Human review determines whether a topic change is actionable.

Serper's terms say it is not affiliated with Google, returns third-party content, and does not warrant result accuracy or completeness. Before production retention, confirm the account terms cover our use, permitted storage/display, attribution, and jurisdiction. Prefer result metadata and source links; do not mirror SERP content or republish snippets.

## 5. Inbound engine workflows

### Engine 01 — Competitor social and content opportunity discovery

Collect permitted website, search, public social, video, event, and press signals. Detect material changes, cluster duplicates, identify audience and message, compare with the approved Sitemap messaging matrix, and propose original MeshDefend angles. Do not copy competitor wording or infer their private metrics.

### Engine 02 — Industry newsletter monitoring and original WTR newsletter

Ingest permitted RSS/publisher/subscribed newsletter material, deduplicate syndication, rank by buyer relevance and novelty, produce a source-linked weekly editorial shortlist, draft the original issue and CTA, and request exact-version approval. If rights or evidence are insufficient, produce a research note rather than a send-ready draft.

### Engine 03 — Blog research and SEO/GEO planning

Build an English buyer-question and topic backlog from Serper results, competitor coverage, public industry sources, and approved knowledge. Produce original briefs and drafts with audience, question, search intent, evidence, outline, CTA, and review needs. Do not use competitor copies or claim search demand from SERP positions alone. This release does not monitor MeshDefend URLs, posts, indexing, traffic, or search performance.

### Engine 04 — Founder thought leadership and podcast reuse

Create founder drafts only from verified public facts and approved views. The named founder approves their own attributed opinions. For podcast work, store guest/source research, recording consent, transcript status, quote permission, reuse rights, edits, episode assets, and approved cross-channel reuse. No synthetic personal experience or unapproved quotes.

## 6. Inbound content approval and execution

Use the states: idea → evidence review → brief → draft → review → approved exact version → staged → published/sent → receipt. Rejected, expired, or superseded versions cannot execute.

One authorized GTM approver can approve the company-controlled channels. Specialist input can be requested, but the source plan does not create extra mandatory approver roles. The approver sees exact text/media, citations, rights notes, destination, audience, CTA, timing, and requested action. If no approval arrives, defer the slot.

Publishing controls:

- CMS integration begins with draft/staging access. A publish action is disabled until exact-version approval and duplicate-execution protection are implemented.
- Newsletter sending requires consent records, suppression/unsubscribe handling, sender-domain checks, exact issue approval, and a receipt.
- Founder social publication remains manual unless the exact official access path and required permissions are available.
- For every action, save the approved payload hash, reviewer identity, time, destination, idempotency key, provider response, and receipt.
- Do not add owned-URL or post-performance monitoring in this release.

## 7. API access and provider setup

Never place credentials in Markdown, source code, a browser client, or chat. Store keys in an approved secrets manager, separate development and production, set budget/usage alerts, and record owner, environment, and rotation date without recording secret values.

| Provider | Needed access | Setup notes and status |
|---|---|---|
| Serper.dev | SERPER_API_KEY environment variable | Selected for competitor/topic Google SERPs. The provided value is in the ignored local .env for development and is not wired into an application. Set a small credit/spend cap, run a low-volume US/India query pilot, and put a rotated production credential in the vault. Confirm terms and retention before production. |
| Apollo.io | API key for company/person search and approved enrichment endpoints | Selected for future outbound company/contact research, not the inbound release. When outbound is approved, an Apollo workspace admin creates the API key in settings; use the documented x-api-key header. Search and enrichment may have different access/credit rules; narrow key scope and check the account plan. No key has been created. |
| Proxycurl | None available | The provider announced shutdown on 2025-07-04. Do not create a key or plan an integration. It is blocked until a working, contract-permitted replacement is selected for future LinkedIn intelligence. |
| Crawl4AI | No key for self-hosted open-source library; hosted Cloud requires its own key | Use the Python package in the source worker by default, pin a version, install browser dependencies, and restrict crawling to approved public URLs. Do not enable stealth or bypass behavior. Hosted mode is a separate provider choice and is not assumed. |
| Gemini API via LiteLLM | GEMINI_API_KEY and GEMINI_MODEL environment variables | Gemini is selected for all current inbound model roles. The provided development key and model alias are in the ignored local .env. Confirm this project can call the chosen model; use Gemini 2.5 Flash only if entitled, otherwise select an active Gemini model. Put production credentials in the secret manager. |
| Embeddings | Provider credential only if a paid/API embedding model is chosen | Embedding model is unselected. Choose model, dimensions, retention, and budget before creating vectors. |
| PostgreSQL | Least-privilege workload/database credential | Provision PostgreSQL, enable pgvector, keep connection credentials in the vault, and restrict the app role to its schemas/tables. |
| YouTube | Google Cloud project and restricted YouTube Data API v3 key | Use for public channel/video metadata and selected query search. Do not request private-channel analytics for competitor monitoring. |
| X | X developer project/app and read access for required endpoints | Verify current read/search availability, prices, and country coverage at setup; create a spend limit. |
| LinkedIn | No scraping key | Use manual Company Page review or a licensed route with explicit use rights. Official access is subject to product review and must not be assumed to expose arbitrary competitor Pages or member profiles. |
| Crawl4AI external-page sources | Usually no separate source credential for public pages | Any login-gated/private content requires explicit account permission and a permitted route. No access-control bypass. |
| Teams, CMS, newsletter ESP | Provider connection/token for selected service | These systems are not yet confirmed. Use minimum scopes and draft-first/publish-after-approval controls. |

### 7.1 Key handling and change readiness

1. For local development, read provider credentials from the ignored .env file. For production, the account owner creates/rotates keys in the provider console and stores them in the secret manager; never commit .env or copy key values into documentation.
2. Confirm the key's API scope, cost/credit behavior, country coverage, retention, and owner. Use a low-volume public-source pilot and save non-secret evidence.
3. Keep API credentials separate by service and environment. Set provider-side limits where supported, plus application-level rate and spend ceilings.
4. Rotate or revoke keys after a suspected leak, staff change, vendor change, or unused integration. Record rotation dates, never values.
5. For retired/restricted services, stop at provider validation. Do not build a fake integration around a retired model or closed API.

## 8. Phase plan

Phases align with [TASK.md](./TASK.md).

### Phase 1 — Secure dashboard foundation, stack, and mandatory RAG (current)

Create the authenticated Next.js/React/TypeScript dashboard and Node.js API, configure Microsoft Entra roles, and provision PostgreSQL with pgvector. Add LangGraph.js state/checkpoint persistence and pg-boss scheduled-work support. The local shell, schema, login gate, role checks, read-only register preview, source-based company/people tables, country-by-country evidence matrix, and Admin environment-status view now exist; external credentials and database access remain unconfigured. Use only the supplied planning files for initial account details. Locate and approve the actual Sitemap messaging matrix, select the embedding model, index the approved chunks, and document retrieval provenance. Validate that the requested LLM model versions are usable; obtain an approved active-model route before production. No own-site crawling or analytics.

**Exit:** the canonical database, vector extension, matrix version, embedding model, retrieved evidence format, approval boundary, and viable model IDs are recorded; no secrets are in project files.

### Phase 2 — Competitor, topic, and source registry

Review the 248-country register against the 13 company blog accounts supplied in the inbound document. Keep the supplied account details as the only initial company/person register; do not add or enrich names, URLs, source priority, or monitoring themes through outside research unless the user directs it. Create the Serper query registry for those accounts and the supplied topics, rotate/reissue the key pasted in chat, define the query budget, run a limited US/India pilot, register permitted website/YouTube/X/LinkedIn/publisher routes, and record country and terms gaps. A/B in the source document is editorial priority only. Apollo is retained for the later outbound release; do not create a contact-enrichment key during this inbound-only phase. Mark Proxycurl unavailable; do not substitute a different LinkedIn provider without a decision.

**Exit:** a reviewer can see candidate status, country evidence, source route, rights notes, cadence, and known gaps. No source is called monitored until an authorized route has succeeded.

### Phase 3 — Inbound source collection and stateful agents

Build Node.js source adapters and LangGraph.js runs, scheduled through pg-boss, for external public pages, Serper results, and approved public-channel/provider sources. Use Crawl4AI only on registered external pages. Route all current inbound agent roles through Gemini via LiteLLM after the key has been rotated and a model ID confirmed. Normalize identity/country, deduplicate, store evidence and source versions, classify material changes, maintain query snapshots, and alert on source failures. Connect the four inbound engines to the shared signal/evidence layer. Do not create outbound agents or monitor MeshDefend's own URLs/posts.

**Exit:** repeated source runs do not create duplicate observations; country/evidence/provenance and source errors are visible; each proposal can be traced to retrieved evidence.

### Phase 4 — Inbound content agents and approval workflow

Build content opportunities, original angles, briefs, drafts, newsletter issues, founder post options, and podcast reuse proposals from verified signals plus RAG-retrieved approved messaging. Add source-backed fact checks, rights/consent checks, exact-version edits, single-approver review, and refusal paths for missing evidence. Connect Teams notifications if selected. Keep CMS publishing and email sending blocked until Phase 5.

**Exit:** one sample brief/draft for each active inbound channel can be reviewed, edited, rejected, and approved with evidence and version history.

### Phase 5 — Controlled inbound publishing

Connect the selected CMS and newsletter provider using minimum scopes. Implement exact-version approval, idempotency, draft-first behavior, send/publish receipts, and failure handling. Keep founder social manual unless the approved official API route is confirmed. Record only execution outcomes needed to prove the action happened; do not add owned-site URL/post monitoring or performance analytics.

**Exit:** an approved draft/send executes once and has an audit receipt; rejected, changed, or expired content cannot publish.

### Phase 6 — Global coverage and operating cadence

Expand registered competitors, source categories, and Serper queries across Tier C countries. Keep English-language gaps visible. Review stale/blocked sources, provider costs, missed material changes, false entity matches, and alert usefulness. Improve the registry from evidence and reviewer feedback. The later outbound release may reuse the same organizations, evidence, permissions, RAG, and approvals but needs its own plan and approval of current scope.

**Exit:** coverage and blind spots are reported by country/source category, with owners and review cadence.

## 9. Future outbound roadmap — deferred

These are not tasks for the current inbound release. Retain them as the requested future engines so the shared architecture can support them later:

| Future engine | Planned purpose | Deferred controls |
|---|---|---|
| Engine 05 — Cyber incidents via GitLab CVEs | Deduplicate GitLab CVE/advisory signals and combine them with confirmed company incident disclosures. A CVE is a vulnerability in a product, not evidence that a named company is breached or has a recovery problem. | Only mark an account affected when product/version and exposure evidence are linked; outbound response needs separate approval. |
| Engine 06 — DPA Rip & Replace | Track the user-named DPA replacement motion and supporting evidence such as verified refresh, support/end-of-life, migration, or public replacement signals. | “DPA” expansion and qualifying signals need confirmation before this engine is built. |
| Engine 07 — Buying signals | Combine public company investment, hiring, transformation, and infrastructure/resilience signals into an explainable account hypothesis. | Signals are not proof of a budget or purchase intent; do not auto-create outreach. |
| Engine 08 — RFP/RFI monitoring | Find public procurement notices and analyze buyer, deadline, eligibility, fit, and possible partner route. | No automatic bid/no-bid, partner contact, or tender submission. |
| Engine 09 — Account briefs | Prepare evidence-backed pre-meeting company and attendee context from permitted sources and, later, authorized CRM records. | Keep verified facts separate from hypotheses and private records access-controlled. |
| Engine 10 — Meeting intelligence and CRM preparation | Turn consent-compliant notes/transcripts into commitments, objections, follow-up drafts, and a proposed CRM diff. | Local recording/consent rules, exact-message approval, CRM owner approval, and idempotent writes. |

GitLab's CVE role is as a CVE Numbering Authority for a defined scope; the CVE is vulnerability intelligence, not a customer incident feed. The future engine should pair CVEs/advisories with authoritative company disclosures and avoid claiming customer impact without evidence.

## 10. Why these decisions

| Decision | Why |
|---|---|
| Inbound-only active release; outbound later | Keeps the current build aligned to the latest user direction while preserving the long-term GTM OS boundary. |
| Serper.dev for competitor Google results | User-selected provider gives a direct API route for country-scoped SERP snapshots. Query snapshots support monitoring; they do not prove market demand or provide complete search coverage. |
| Next.js + LangGraph.js | Keeps the team dashboard, server routes, durable orchestration state, review interrupts, and bounded agent steps in one operating product. |
| LiteLLM gateway | Centralizes model selection and spend/usage monitoring. Version lifecycle and account entitlement still need validation. |
| PostgreSQL + pgvector in Phase 1 | One database handles canonical records and required RAG retrieval over approved messaging; avoids a separate vector store. |
| Apollo.io for future outbound contact research | It is the selected contact-data API, but coverage, credits, plan access, data rights, and country quality remain measurable constraints. |
| Crawl4AI for public web extraction | Isolated Python worker called by the Node application; use only on permitted external URLs and preserve provenance. |
| No own-site monitoring now | Keeps MeshDefend URLs/posts out of the monitoring corpus. The approved messaging matrix is a static internal RAG asset, not a live site-monitoring target. |
| Evidence-first and one human approver | Prevents model inference from being presented as fact and prevents unintended publishing or outreach. |

## 11. Operating measures for this release

- **Source coverage:** verified competitor-country-source rows; fresh/stale/blocked/manual counts; Serper query coverage by country; successful source runs.
- **Evidence quality:** duplicate rate, wrong entity/country rate, unsupported claim rate, citation completeness, correction rate.
- **Agent reliability:** run completion/failure, retries, checkpoint recovery, provider errors, token/credit use, approval latency.
- **Editorial quality:** original-angle acceptance, factual corrections, rights/consent exceptions, reviewer time, draft acceptance/rewrite rate.
- **Execution integrity:** approved-version hash match, duplicate publish/send prevention, provider receipts, failed/expired action rate.
- **Cost:** Serper credits, LLM spend, Crawl4AI hosting/browser runtime, human review time.

Do not track owned-site rankings, page analytics, or own-post engagement in this release.

## 12. Risks and unresolved decisions

1. **Proxycurl is unavailable.** Its operator announced the shutdown on July 4, 2025. No key can be created and the provider cannot deliver the requested LinkedIn data. The current work must leave this as a blocker rather than use a scraper or silently substitute another service.
2. **The development keys were shared in chat.** Keep them out of tracked files and rotate them before production. Confirm an active Gemini model ID; Gemini 2.5 Flash access is limited for new projects.
4. **Embedding model is unselected.** The RAG table cannot be defined until model, vector dimensions, and cost/retention are known.
5. **Sitemap messaging matrix is missing from the files reviewed.** Its location/owner and approved version are required to complete Phase 1 RAG.
6. **DPA is not expanded in the supplied DOCX files.** It stays in the later outbound roadmap with a working label until defined.
7. **Serper terms, retention, accuracy, country/language coverage, and cost must be checked before production.** Search results are snapshots, not complete market coverage or search-volume data.
8. **Apollo and channel coverage varies by plan, endpoint, country, and credits.** A provider key does not prove source rights or completeness.
9. **LinkedIn collection remains restricted.** Use a permitted manual or licensed route; do not scrape member profiles or simulate user activity.
10. **The competitor universe is not provably exhaustive.** The system reports observed coverage and known gaps instead of claiming “every competitor” or “every post.”

## Research references

- [Google Gemini 2.5 Flash model status](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)
- [Google Gemini model deprecations](https://ai.google.dev/gemini-api/docs/deprecations)
- [Serper.dev Search API and current product information](https://serper.dev/)
- [Serper.dev Terms of Service and Data License](https://serper.dev/terms)
- [Apollo API authentication](https://docs.apollo.io/reference/authentication)
- [Apollo People API Search](https://docs.apollo.io/reference/people-api-search)
- [Apollo People Enrichment](https://docs.apollo.io/reference/people-enrichment)
- [Proxycurl shutdown announcement](https://nubela.co/blog/goodbye-proxycurl/)
- [Crawl4AI documentation](https://docs.crawl4ai.com/)
- [Crawl4AI official hosted service and API](https://crawl4ai.com/docs/)
- [LiteLLM supported providers](https://docs.litellm.ai/docs/providers/)
- [LangGraph.js overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [Next.js deployment documentation](https://nextjs.org/docs/app/getting-started/deploying)
- [pgvector project](https://github.com/pgvector/pgvector)
- [GitLab CVE Numbering Authority](https://about.gitlab.com/security/cve/)
- [GitLab security FAQ and vulnerability-release feeds](https://about.gitlab.com/security/faq/)
- [LinkedIn prohibited scraping and automation](https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions)
- [YouTube Data API search endpoint](https://developers.google.com/youtube/v3/docs/search/list)
- [X Developer Platform](https://developer.x.com/)
- [Microsoft Teams Workflows webhook guidance](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
- [UN Statistics Division M49 country and area codes](https://unstats.un.org/unsd/methodology/m49/overview/)
- [Supplied inbound playbook](./MD%20Inbound%20Engine.docx)
- [Supplied GTM OS implementation plan](./MeshDefend%20GTM%20OS%20-%20Implementation%20Plan.docx)
