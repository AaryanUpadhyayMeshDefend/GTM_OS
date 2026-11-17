"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, BookOpenCheck,
  CheckCircle2, ChevronDown, CircleHelp, Compass, Database, FileText, Globe2, LayoutDashboard,
  ListChecks, LockKeyhole, LogOut, Menu, MessageSquareText, Newspaper, Podcast, RefreshCw, Search,
  Settings2, ShieldCheck, Signal, Target, Users, Workflow, X,
} from "lucide-react";
import type { Competitor, Country, DashboardData, CurrentUser, IntegrationStatus, SourceRoute, Topic } from "@/lib/types";

type View = "overview" | "market" | "coverage" | "topics" | "sources" | "content" | "approvals" | "publishing" | "engines" | "admin";

const inboundEngines = [
  { id: "01", icon: Signal, name: "Market & competitor signals", description: "Track public competitor and industry signals by country; turn verified changes into content opportunities.", outputs: "Signals · evidence · opportunity briefs" },
  { id: "02", icon: Newspaper, name: "WTR newsletter", description: "Research external sources and prepare evidence-backed newsletter issues for review.", outputs: "Weekly issue · source notes · links" },
  { id: "03", icon: FileText, name: "Blog research & SEO/GEO", description: "Find buyer questions, shape original articles, and keep claims tied to approved evidence.", outputs: "Topic backlog · briefs · article drafts" },
  { id: "04", icon: Podcast, name: "Founder & podcast studio", description: "Prepare founder posts, guest briefs, and podcast reuse with rights and exact-version review.", outputs: "Post drafts · guest briefs · episode assets" },
];

const outboundEngines = [
  { id: "05", name: "Cyber incident intelligence", detail: "GitLab CVEs paired with verified company incident disclosures." },
  { id: "06", name: "DPA Rip & Replace", detail: "Verified refresh, migration, and replacement signals." },
  { id: "07", name: "Buying signals", detail: "Explainable hiring, investment, and transformation hypotheses." },
  { id: "08", name: "RFP / RFI monitor", detail: "Public tenders, deadlines, eligibility, and fit." },
  { id: "09", name: "Account briefs", detail: "Evidence-linked company and meeting context." },
  { id: "10", name: "Meeting & CRM preparation", detail: "Consent-aware notes, follow-ups, and proposed CRM changes." },
];

const routes = [
  { name: "Google Search", provider: "Serper.dev", description: "Country-scoped competitor and industry query snapshots.", status: "Selected · connector pending", icon: Search },
  { name: "External websites", provider: "Crawl4AI worker", description: "Registered public competitor and publisher pages only.", status: "Worker not configured", icon: Globe2 },
  { name: "YouTube", provider: "YouTube Data API", description: "Public videos and channels; quota tracked per query.", status: "Access pending", icon: Podcast },
  { name: "X", provider: "X API", description: "Public posts through an approved API plan.", status: "Access pending", icon: MessageSquareText },
  { name: "LinkedIn", provider: "Manual / licensed", description: "Company Pages only; no member-profile scraping.", status: "Route pending", icon: Users },
  { name: "Newsletters & publishers", provider: "RSS / permitted sources", description: "Public feeds and publisher sources with terms recorded.", status: "Source list pending", icon: BookOpenCheck },
];

const phases = [
  { n: "01", title: "Secure foundation", status: "In progress", text: "Login, roles, audit trail, database, and full OS workspace." },
  { n: "02", title: "Market registry", status: "Next", text: "Verify companies, country presence, sources, and search queries." },
  { n: "03", title: "Inbound monitoring", status: "Planned", text: "Scheduled source collection, evidence, freshness, and failure states." },
  { n: "04", title: "Content & approvals", status: "Planned", text: "Inbound agents, approved messaging retrieval, and human review." },
  { n: "05", title: "Controlled publishing", status: "Planned", text: "Draft-first CMS/newsletter workflows with approval receipts." },
  { n: "06", title: "Global expansion", status: "Planned", text: "Extend verified coverage across Tier C markets and report blind spots." },
];

const foundation = [
  { name: "Identity & access", text: "Microsoft Entra SSO · assigned team access · role-checked actions", icon: ShieldCheck, state: "Needs tenant setup" },
  { name: "Evidence & knowledge", text: "PostgreSQL + pgvector · versioned approved messaging RAG", icon: Database, state: "Matrix pending" },
  { name: "Agent orchestration", text: "LangGraph.js · saved runs · human approval pauses", icon: Workflow, state: "Not connected" },
  { name: "Audit & operations", text: "Source runs · approvals · provider usage · execution receipts", icon: Activity, state: "Foundation in progress" },
];

const viewLabels: Record<View, string> = {
  overview: "Overview", market: "Company & people accounts", coverage: "Country coverage", topics: "Topic radar",
  sources: "Source routes", content: "Inbound content", approvals: "Approval inbox", publishing: "Publishing receipts",
  engines: "Engine roadmap", admin: "Team & settings",
};

const tiersLabel = (tier: string) => tier === "tier_a" ? "Tier A" : "Tier C";
const humanize = (value: string) => (value || "not reviewed").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
const safeHref = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; } catch { return ""; }
};

function StatusBadge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" | "slate" | "red" }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>;
}

function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="panel-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action}</div>;
}

function TableFrame({ children }: { children: React.ReactNode }) {
  return <div className="panel table-panel"><div className="table-scroll">{children}</div></div>;
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="search-field"><Search size={16} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export function DashboardShell({ data, user, authConfigured, integrations }: { data: DashboardData; user: CurrentUser; authConfigured: boolean; integrations: IntegrationStatus }) {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [countryTier, setCountryTier] = useState("all");
  const [competitorQuery, setCompetitorQuery] = useState("");
  const [influencerQuery, setInfluencerQuery] = useState("");
  const [marketTab, setMarketTab] = useState<"companies" | "voices">("companies");
  const [topicQuery, setTopicQuery] = useState("");
  const [topicCountry, setTopicCountry] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [reviewPair, setReviewPair] = useState<{ competitorId: string; competitorName: string; countryCode: string; status: string; evidenceUrl: string; evidenceNote: string } | null>(null);
  const [savingCoverage, setSavingCoverage] = useState(false);
  const [coverageError, setCoverageError] = useState("");
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen((open) => !open);
      }
      if (event.key === "Escape") setGlobalSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const filteredCountries = useMemo(() => data.countries.filter((country) => {
    const search = countryQuery.toLowerCase();
    return (!search || `${country.name} ${country.code} ${country.alpha3} ${country.region}`.toLowerCase().includes(search))
      && (countryTier === "all" || country.tier === countryTier);
  }), [data.countries, countryQuery, countryTier]);
  const filteredCompetitors = useMemo(() => data.competitors.filter((company) =>
    `${company.name} ${company.focus} ${company.priorityHint} ${company.url}`.toLowerCase().includes(competitorQuery.toLowerCase())),
  [data.competitors, competitorQuery]);
  const filteredInfluencers = useMemo(() => data.influencers.filter((account) =>
    `${account.name} ${account.primaryValue} ${account.evidenceNote}`.toLowerCase().includes(influencerQuery.toLowerCase())),
  [data.influencers, influencerQuery]);
  const filteredTopics = useMemo(() => data.topics.filter((topic) =>
    `${topic.cluster} ${topic.terms} ${topic.country}`.toLowerCase().includes(topicQuery.toLowerCase())
    && (topicCountry === "all" || topic.country === topicCountry)), [data.topics, topicQuery, topicCountry]);
  const selectedCountryRecord = data.countries.find((country) => country.code === selectedCountry);
  const selectedCountryPairs = data.countryPresence.filter((pair) => pair.countryCode === selectedCountry);
  const searchResults = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();
    if (!term) return [];
    return [
      ...data.competitors.filter((item) => `${item.name} ${item.focus}`.toLowerCase().includes(term)).slice(0, 4).map((item) => ({ title: item.name, detail: "Company blog account", view: "market" as View })),
      ...data.countries.filter((item) => `${item.name} ${item.code} ${item.region}`.toLowerCase().includes(term)).slice(0, 4).map((item) => ({ title: item.name, detail: `${item.code} · ${tiersLabel(item.tier)}`, view: "coverage" as View, code: item.code })),
      ...data.topics.filter((item) => `${item.cluster} ${item.terms}`.toLowerCase().includes(term)).slice(0, 4).map((item) => ({ title: item.cluster, detail: `${item.country} · topic seed`, view: "topics" as View })),
      ...data.influencers.filter((item) => `${item.name} ${item.primaryValue}`.toLowerCase().includes(term)).slice(0, 4).map((item) => ({ title: item.name, detail: "LinkedIn account · manual review", view: "market" as View, marketTab: "voices" as const })),
    ].slice(0, 8);
  }, [data.competitors, data.countries, data.influencers, data.topics, globalSearch]);

  const navigate = (next: View) => { setView(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const saveCoverage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewPair) return;
    setSavingCoverage(true);
    setCoverageError("");
    try {
      const response = await fetch("/api/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPair),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update coverage.");
      setReviewPair(null);
      router.refresh();
    } catch (error) {
      setCoverageError(error instanceof Error ? error.message : "Could not update coverage.");
    } finally {
      setSavingCoverage(false);
    }
  };
  const navButton = (next: View, label: string, Icon: typeof LayoutDashboard, group?: string) => (
    <button key={next} className={`nav-item ${view === next ? "active" : ""}`} onClick={() => navigate(next)}>
      <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{group === "later" && <span className="nav-later">Later</span>}
    </button>
  );
  return (
    <div className="os-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); navigate("overview"); }}>
          <span className="brand-symbol"><span /><span /><span /></span>
          <span className="brand-copy"><strong>meshdefend</strong><small>GTM OPERATING SYSTEM</small></span>
        </a>
        <div className="workspace-select"><div className="workspace-avatar">M</div><div><small>WORKSPACE</small><strong>MeshDefend GTM</strong></div><ChevronDown size={15} /></div>
        <div className="phase-label"><span className="live-indicator" /> INBOUND RELEASE · PHASE 1</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <div className="nav-group-label">WORKSPACE</div>
          {navButton("overview", "Overview", LayoutDashboard)}
          {navButton("market", "Company & people accounts", Compass)}
          {navButton("coverage", "Country coverage", Globe2)}
          {navButton("topics", "Topic radar", Search)}
          {navButton("sources", "Sources & runs", Activity)}
          <div className="nav-group-label nav-gap">INBOUND ENGINES</div>
          {navButton("content", "Content studio", FileText)}
          {navButton("approvals", "Approval inbox", ListChecks)}
          {navButton("publishing", "Publishing receipts", CheckCircle2)}
          <div className="nav-group-label nav-gap">FULL GTM OS</div>
          {navButton("engines", "Engine roadmap", Target)}
          {user.roles.includes("admin") && navButton("admin", "Team & settings", Settings2)}
          <div className="nav-group-label nav-gap">OUTBOUND · COMING LATER</div>
          {outboundEngines.map((engine) => <button key={engine.id} className="nav-item nav-deferred" disabled title="Deferred until the outbound release"><LockKeyhole size={14} /><span>{engine.id} · {engine.name}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><ShieldCheck size={16} /><span>Internal workspace<br /><b>Entra access required</b></span></div>
          <div className="user-profile">
            <div className="user-avatar">{user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="user-details"><strong>{user.name}</strong><small>{user.preview ? "Local preview" : humanize(user.roles.join(" · "))}</small></div>
            {user.preview ? <span className="preview-tag">PREVIEW</span> : <button className="logout-button" aria-label="Sign out" onClick={() => signOut({ redirectTo: "/login" })}><LogOut size={16} /></button>}
          </div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}
      <main className="main-shell">
        <header className="topbar">
          <button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>GTM OS</span><span className="breadcrumb-slash">/</span><strong>{viewLabels[view]}</strong></div>
          <div className="topbar-actions">
            <button className="global-search-trigger" onClick={() => setGlobalSearchOpen(true)}><Search size={15} /><span>Search the OS...</span><kbd>⌘ K</kbd></button>
            <div className="topbar-scope"><span className="live-indicator" /> INBOUND ACTIVE <span className="scope-divider" /> OUTBOUND LATER</div>
            <button className="topbar-icon" aria-label="Refresh data" onClick={() => router.refresh()}><RefreshCw size={16} /></button>
            <div className="topbar-avatar">{user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
          </div>
        </header>

        {globalSearchOpen && <div className="command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGlobalSearchOpen(false); }}><section className="command-dialog" role="dialog" aria-modal="true" aria-label="Search the GTM OS"><div className="command-input"><Search size={18} /><input autoFocus value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search companies, people, countries, and topics" /><kbd>ESC</kbd></div><div className="command-results">{searchResults.map((result, index) => <button key={`${result.title}-${index}`} onClick={() => { if ("code" in result && typeof result.code === "string") setSelectedCountry(result.code); if ("marketTab" in result && (result.marketTab === "companies" || result.marketTab === "voices")) setMarketTab(result.marketTab); navigate(result.view); setGlobalSearchOpen(false); }}><span className="command-result-icon"><Search size={15} /></span><span><strong>{result.title}</strong><small>{result.detail}</small></span><ArrowRight size={14} /></button>)}{globalSearch && searchResults.length === 0 && <div className="command-empty">No matching registered record.</div>}{!globalSearch && <div className="command-empty">Search registered companies, all country records, and topic seeds.</div>}</div></section></div>}

        <div className="page-wrap">
          {data.mode === "seed-preview" && <div className="preview-banner"><ShieldCheck size={16} /><span><strong>Local preview mode.</strong> Showing planning registers only; no providers have run and no credentials were loaded into this browser.</span></div>}
          {data.mode === "database" && <div className="preview-banner notice-live"><Database size={16} /><span><strong>Connected workspace.</strong> Live status reflects recorded source runs; registered rows alone are not counted as monitored.</span></div>}

          {view === "overview" && <>
            <div className="page-heading">
              <div><div className="eyebrow">MESHDEFEND GTM OS <span className="eyebrow-divider">/</span> OPERATIONS</div><h1>Workspace overview</h1><p className="page-subtitle">A single workspace for company signals, market coverage, inbound content, and approvals.</p></div>
              <div className="heading-actions"><StatusBadge tone="blue">INBOUND RELEASE</StatusBadge><button className="button-secondary" onClick={() => router.refresh()}><RefreshCw size={15} /> Refresh</button></div>
            </div>
            <div className="register-summary" aria-label="Records from supplied planning documents">
              <div><span>Company blogs</span><strong>{data.competitors.length}</strong><small>listed accounts</small></div>
              <div><span>LinkedIn voices</span><strong>{data.influencers.length}</strong><small>manual review only</small></div>
              <div><span>Search topics</span><strong>{data.topics.length}</strong><small>seed rows</small></div>
              <div><span>Markets</span><strong>{data.countries.length}</strong><small>country / area records</small></div>
            </div>
            <section className="panel queue-panel">
              <div className="panel-heading"><div><div className="eyebrow">WORK QUEUE</div><h2>Monitoring and setup status</h2></div><span className="table-count">Inbound · current release</span></div>
              <div className="table-scroll"><table><thead><tr><th>Workspace area</th><th>Registered</th><th>Current status</th><th>Next step</th></tr></thead><tbody>
                <tr><td><strong>Company accounts</strong><small>Supplied inbound plan</small></td><td>{data.competitors.length} company blog accounts</td><td><StatusBadge tone="amber">Identity and country review pending</StatusBadge></td><td><button className="table-action" onClick={() => navigate("market")}>Review accounts</button></td></tr>
                <tr><td><strong>Country presence</strong><small>All registered companies × markets</small></td><td>{data.competitors.length * data.countries.length} possible pairs</td><td>{data.countryPresence.filter((pair) => pair.status === "verified_present").length} verified; {data.coverageByCountry.reduce((sum, item) => sum + item.activeSources, 0)} active country routes</td><td><button className="table-action" onClick={() => navigate("coverage")}>Open country matrix</button></td></tr>
                <tr><td><strong>Search monitoring</strong><small>Serper.dev selected</small></td><td>{data.topics.length} topic rows</td><td>{integrations.serper ? "API key present · connection untested" : "API key not configured"}</td><td><button className="table-action" onClick={() => navigate("topics")}>Review topic seeds</button></td></tr>
                <tr><td><strong>External sources</strong><small>Company blogs and approved channels</small></td><td>{data.sources.length} listed routes</td><td>{data.summary.recentRuns} checks in 7 days · {data.summary.failedRuns} failed</td><td><button className="table-action" onClick={() => navigate("sources")}>View source status</button></td></tr>
                <tr><td><strong>Editorial approvals</strong><small>One designated approver</small></td><td>{data.summary.pendingApprovals} awaiting review</td><td>{authConfigured ? "Identity values present · sign-in untested" : "Microsoft Entra setup required"}</td><td><button className="table-action" onClick={() => navigate("approvals")}>Open approvals</button></td></tr>
                <tr><td><strong>Database and RAG</strong><small>PostgreSQL + pgvector</small></td><td>{data.summary.recentEvidence} evidence items in 7 days</td><td>{integrations.database ? "Database URL present · connection untested" : "Database not configured"}</td><td><button className="table-action" onClick={() => navigate("admin")}>View setup</button></td></tr>
              </tbody></table></div>
            </section>
            <section className="panel engine-status-panel">
              <div className="panel-heading"><div><div className="eyebrow">FULL GTM OS · ACTIVE BUILD</div><h2>Inbound engines 01–04</h2></div><button className="link-button" onClick={() => navigate("engines")}>Full engine map <ArrowRight size={14} /></button></div>
              <div className="table-scroll"><table><thead><tr><th>Engine</th><th>Purpose</th><th>Current state</th></tr></thead><tbody>{inboundEngines.map((engine) => <tr key={engine.id}><td><strong>{engine.id} · {engine.name}</strong></td><td>{engine.outputs}</td><td><StatusBadge tone="amber">Not connected</StatusBadge></td></tr>)}</tbody></table></div>
              <div className="deferred-line"><LockKeyhole size={14} /><span>Outbound engines 05–10 are visible in the roadmap and remain deferred in this release.</span><button className="link-button" onClick={() => navigate("engines")}>View roadmap <ArrowRight size={14} /></button></div>
            </section>
          </>}

          {view === "market" && <>
            <PageTitle eyebrow="INBOUND SOURCE REGISTRY" title="Company & people accounts" subtitle="Accounts and monitoring details as listed in MD Inbound Engine.docx. Company blog priority A/B is the source document’s priority, not country coverage or verification." badge="SOURCE-BASED REGISTRY" badgeTone="blue" />
            <div className="register-tabs" role="tablist" aria-label="Market account lists">
              <button id="company-tab" role="tab" aria-selected={marketTab === "companies"} aria-controls="company-accounts-panel" className={marketTab === "companies" ? "active" : ""} onClick={() => setMarketTab("companies")}>Company blogs <span>{data.competitors.length}</span></button>
              <button id="voices-tab" role="tab" aria-selected={marketTab === "voices"} aria-controls="linkedin-voices-panel" className={marketTab === "voices" ? "active" : ""} onClick={() => setMarketTab("voices")}>LinkedIn voices <span>{data.influencers.length}</span></button>
            </div>
            <div className="table-toolbar"><SearchField value={marketTab === "companies" ? competitorQuery : influencerQuery} onChange={marketTab === "companies" ? setCompetitorQuery : setInfluencerQuery} placeholder={marketTab === "companies" ? "Search company or monitoring focus" : "Search person or area of interest"} /><span className="table-count">{marketTab === "companies" ? filteredCompetitors.length : filteredInfluencers.length} listed in source</span></div>
            {marketTab === "companies" && <div id="company-accounts-panel" role="tabpanel" aria-labelledby="company-tab"><TableFrame><table><thead><tr><th>Company blog account</th><th>Source priority</th><th>Monitoring focus from document</th><th>Listed blog</th><th>Collection route</th></tr></thead><tbody>{filteredCompetitors.map((company) => <CompetitorRow key={company.id} company={company} source={data.sources.find((item) => item.company === company.name)} />)}</tbody></table>{!filteredCompetitors.length && <EmptyTable text="No company account matches this search." />}</TableFrame></div>}
            {marketTab === "voices" && <div id="linkedin-voices-panel" role="tabpanel" aria-labelledby="voices-tab"><TableFrame><table><thead><tr><th>LinkedIn account</th><th>Primary value from document</th><th>Evidence note in document</th><th>Collection route</th><th>Profile</th></tr></thead><tbody>{filteredInfluencers.map((account) => <InfluencerRow key={account.id} account={account} />)}</tbody></table>{!filteredInfluencers.length && <EmptyTable text="No LinkedIn account matches this search." />}</TableFrame></div>}
            <div className="inline-notice"><CircleHelp size={16} /><span>Company and individual accounts are separate lists from the supplied document. LinkedIn member profiles are manual review only; no profile scraping or activity collection is enabled.</span></div>
          </>}

          {view === "coverage" && <>
            <PageTitle eyebrow="COUNTRY-BY-COUNTRY MONITORING" title="Country coverage" subtitle="Review every listed company account against all 248 country and area records. Presence and monitoring stay unconfirmed until country evidence and a successful permitted source check exist." badge={data.countries.length + " MARKETS"} badgeTone="blue" />
            <div className="coverage-ledger" aria-label="Country coverage totals">
              <div><span>Country / area records</span><strong>{data.countries.length}</strong></div>
              <div><span>Company accounts</span><strong>{data.competitors.length}</strong></div>
              <div><span>Possible review pairs</span><strong>{data.competitors.length * data.countries.length}</strong></div>
              <div><span>Verified presence</span><strong>{data.countryPresence.filter((pair) => pair.status === "verified_present").length}</strong></div>
            </div>
            <div className="inline-notice warning"><AlertTriangle size={16} /><span>The source document lists company blogs; it does not prove country presence. US, India, and every other market remain unreviewed until evidence is added. A listed global URL is not a country monitor.</span></div>
            <section className="panel matrix-panel">
              <div className="panel-heading"><div><div className="eyebrow">COMPANY ACCOUNT × COUNTRY REVIEW</div><h2>{selectedCountryRecord?.name ?? selectedCountry} <span className="matrix-code">{selectedCountry}</span></h2></div><label className="matrix-country-select"><span>Selected country</span><select className="filter-select" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)}>{data.countries.map((country) => <option value={country.code} key={country.code}>{country.name} · {country.code}</option>)}</select></label></div>
              <div className="matrix-caption"><span>Each row is one company blog account from the supplied plan.</span><span>{selectedCountryPairs.filter((pair) => pair.status === "verified_present").length} verified of {data.competitors.length}</span></div>
              <div className="table-scroll"><table><thead><tr><th>Company account</th><th>Presence status</th><th>Country evidence</th><th>Listed source / route state</th>{!user.preview && (user.roles.includes("admin") || user.roles.includes("member")) && <th>Action</th>}</tr></thead><tbody>{data.competitors.map((company) => <CountryPresenceRow key={company.id} company={company} pair={selectedCountryPairs.find((item) => item.competitorId === company.id)} source={data.sources.find((item) => item.company === company.name && item.country === selectedCountry) ?? data.sources.find((item) => item.company === company.name)} canEdit={!user.preview && (user.roles.includes("admin") || user.roles.includes("member"))} onReview={() => { const pair = selectedCountryPairs.find((item) => item.competitorId === company.id); setReviewPair({ competitorId: company.id, competitorName: company.name, countryCode: selectedCountry, status: pair?.status ?? "not_reviewed", evidenceUrl: pair?.evidenceUrl ?? "", evidenceNote: pair?.evidenceNote ?? "" }); }} />)}</tbody></table>{!data.competitors.length && <EmptyTable text="No company accounts are registered." />}</div>
            </section>
            <details className="country-directory">
              <summary>Browse all country and area records <span>{data.countries.length}</span></summary>
              <div className="country-directory-content"><div className="table-toolbar"><SearchField value={countryQuery} onChange={setCountryQuery} placeholder="Search country, code, or region" /><select className="filter-select" value={countryTier} onChange={(event) => setCountryTier(event.target.value)}><option value="all">All market tiers</option><option value="tier_a">Tier A · priority</option><option value="tier_c">Tier C · global watch</option></select><span className="table-count">{filteredCountries.length} shown</span></div>
                <TableFrame><table><thead><tr><th>Country / area</th><th>Code</th><th>Region</th><th>Market tier</th><th>Verified company presence</th><th>Active country sources</th></tr></thead><tbody>{filteredCountries.map((country) => <CountryRow key={country.code} country={country} coverage={data.coverageByCountry.find((entry) => entry.countryCode === country.code)} />)}</tbody></table>{!filteredCountries.length && <EmptyTable text="No country matches these filters." />}</TableFrame>
              </div>
            </details>
          </>}

          {view === "topics" && <><PageTitle eyebrow="SEARCH & INDUSTRY SIGNALS" title="Topic radar" subtitle="English topic seeds for US and India. Serper.dev is selected for external Google Search snapshots; the connector is not live." badge={`${data.topics.length} SEEDS`} badgeTone="amber" /><div className="table-toolbar"><SearchField value={topicQuery} onChange={setTopicQuery} placeholder="Search cluster or seed phrase" /><select className="filter-select" value={topicCountry} onChange={(event) => setTopicCountry(event.target.value)}><option value="all">All countries</option><option value="US">United States</option><option value="IN">India</option></select><span className="table-count">{filteredTopics.length} shown</span></div><TableFrame><table><thead><tr><th>Topic cluster</th><th>Market</th><th>Seed terms</th><th>Source plan</th><th>Validation</th></tr></thead><tbody>{filteredTopics.map((topic) => <TopicRow key={`${topic.id}-${topic.country}`} topic={topic} />)}</tbody></table>{!filteredTopics.length && <EmptyTable text="No topic rows match these filters." />}</TableFrame><p className="table-footnote">Serper results are query snapshots. They do not represent the entire search index or prove search volume.</p></>}

          {view === "sources" && <><PageTitle eyebrow="MONITORING CONTROL PLANE" title="Sources & runs" subtitle="Track external source access, freshness, failures, and evidence by country." badge="NO LIVE CONNECTORS" badgeTone="slate" /><div className="route-grid">{routes.map((route) => <RouteCard key={route.name} route={route} large />)}</div><div className="section-heading table-section-heading"><div><div className="eyebrow">REGISTERED SOURCE ROUTES</div><h2>Source checks</h2></div><span className="table-count">{data.sources.length} listed</span></div><TableFrame><table><thead><tr><th>Company / source</th><th>Country</th><th>Platform</th><th>Collection route</th><th>Monitoring status</th><th>Last success</th></tr></thead><tbody>{data.sources.map((source) => <tr key={source.id}><td><strong>{source.company || "Industry source"}</strong></td><td>{source.country || "Global · no country link"}</td><td>{source.platform}</td><td>{source.route || "Pending"}</td><td><StatusBadge tone={source.enabled && source.lastSuccess && source.country ? "green" : "amber"}>{source.enabled && source.lastSuccess && source.country ? "Monitored · country route" : "Registered · not monitored"}</StatusBadge></td><td>{source.lastSuccess || "Never"}</td></tr>)}</tbody></table>{data.sources.length === 0 && <div className="empty-state"><div className="empty-icon"><Activity size={22} /></div><strong>No source routes registered</strong><span>Verify a company and country, then add an approved collection route before scheduling checks.</span></div>}</TableFrame><div className="inline-notice"><ShieldCheck size={16} /><span>Only external public sources are in scope. Do not use stealth, access bypass, or unauthorized LinkedIn scraping.</span></div></>}

          {view === "content" && <><PageTitle eyebrow="INBOUND EDITORIAL WORKSPACE" title="Content studio" subtitle="Four inbound engines share evidence, voice rules, and editorial review. Outbound work stays outside this release." badge="BUILD NOT CONNECTED" badgeTone="slate" /><div className="content-stats"><MiniMetric label="Drafts in progress" value="0" detail="No agent runs yet" icon={FileText} /><MiniMetric label="Awaiting approval" value={data.summary.pendingApprovals} detail="Exact-version review" icon={ListChecks} /><MiniMetric label="Evidence items" value={data.summary.recentEvidence} detail="Collected in the last 7 days" icon={BookOpenCheck} /></div><div className="engine-grid engine-grid-large">{inboundEngines.map((engine) => <EngineCard key={engine.id} engine={engine} active />)}</div><div className="inline-notice warning"><CircleHelp size={16} /><span>Content generation remains disabled until approved brand claims, founder voice guidance, the Sitemap messaging matrix, and a usable embedding model are available.</span></div></>}

          {view === "approvals" && <><PageTitle eyebrow="HUMAN CONTROL" title="Approval inbox" subtitle="One authorized approver reviews the exact content version and evidence before any company-controlled action." badge={`${data.summary.pendingApprovals} PENDING`} badgeTone={data.summary.pendingApprovals ? "amber" : "green"} /><div className="approval-empty"><div className="approval-check"><ListChecks size={25} /></div><h2>Nothing awaiting review</h2><p>New inbound drafts will appear here with their supporting sources, claim notes, and version history.</p><span><ShieldCheck size={14} /> Approval is not connected until the Entra approver is configured.</span></div></>}

          {view === "publishing" && <><PageTitle eyebrow="CONTROLLED EXECUTION" title="Publishing receipts" subtitle="Record exactly what an approved inbound publishing action executed. This is not an owned-site performance monitor." badge="DRAFT-FIRST" badgeTone="blue" /><div className="approval-empty"><div className="approval-check"><CheckCircle2 size={25} /></div><h2>No publishing actions yet</h2><p>CMS and newsletter connections are deferred until the approval workflow and provider accounts are configured.</p><span><ShieldCheck size={14} /> No automatic send or publish actions are enabled.</span></div></>}

          {view === "engines" && <><PageTitle eyebrow="FULL GTM OS" title="Engine roadmap" subtitle="The platform contains ten engines. Inbound engines 01–04 are the active build; outbound engines 05–10 are deferred." badge="INBOUND NOW" badgeTone="blue" /><div className="phase-banner"><div className="phase-chip">01</div><div><strong>Inbound release · current</strong><span>Market listening, editorial proposals, review, and approved publishing for engines 01–04.</span></div><StatusBadge tone="green">ACTIVE BUILD</StatusBadge></div><div className="engine-grid engine-grid-large">{inboundEngines.map((engine) => <EngineCard key={engine.id} engine={engine} active />)}</div><div className="phase-banner future-phase"><div className="phase-chip">02</div><div><strong>Outbound release · later</strong><span>Visible for planning; no outbound collection, CRM write, prospecting, or outreach in this release.</span></div><StatusBadge>DEFERRED</StatusBadge></div><div className="outbound-grid">{outboundEngines.map((engine) => <article className="outbound-card" key={engine.id}><span className="outbound-id">{engine.id}</span><div><strong>{engine.name}</strong><p>{engine.detail}</p></div><StatusBadge>ROADMAP</StatusBadge></article>)}</div><div className="section-heading phase-heading"><div><div className="eyebrow">DELIVERY PLAN</div><h2>Implementation phases</h2></div></div><div className="phase-grid">{phases.map((phase, index) => <article className={`phase-card ${index === 0 ? "phase-current" : ""}`} key={phase.n}><div className="phase-card-top"><span>{phase.n}</span><StatusBadge tone={index === 0 ? "blue" : "slate"}>{phase.status}</StatusBadge></div><strong>{phase.title}</strong><p>{phase.text}</p></article>)}</div><div className="section-heading phase-heading"><div><div className="eyebrow">SHARED PLATFORM</div><h2>Foundations for every engine</h2></div></div><div className="foundation-grid">{foundation.map((item) => <article className="foundation-card" key={item.name}><div className="foundation-icon"><item.icon size={18} /></div><div><strong>{item.name}</strong><p>{item.text}</p><small>{item.state}</small></div></article>)}</div></>}

          {view === "admin" && <><PageTitle eyebrow="WORKSPACE ADMINISTRATION" title="Team & settings" subtitle="The dashboard is the operating surface; secrets stay on its server and only configuration health appears here." badge="ADMIN" badgeTone="blue" /><div className="setup-grid"><SetupCard title="Microsoft Entra" state={authConfigured ? "Required values present · sign-in untested" : "Credentials required"} text="ENTRA_TENANT_ID · ENTRA_CLIENT_ID · ENTRA_CLIENT_SECRET · AUTH_SECRET · ENTRA_ACCESS_APP_ROLE · BOOTSTRAP_ADMIN_OID · APPROVER_ENTRA_OID. Assigned team access only." icon={ShieldCheck} /><SetupCard title="PostgreSQL + pgvector" state={integrations.database ? "DATABASE_URL present · connection untested" : "DATABASE_URL required"} text="DATABASE_URL · DATABASE_SSL. Holds team access, market registers, source history, approvals, and audit records." icon={Database} /><SetupCard title="Serper.dev" state={integrations.serper ? "SERPER_API_KEY present · connection untested" : "SERPER_API_KEY required"} text="Google Search snapshots for external competitors and industry topics only." icon={Search} /><SetupCard title="Gemini via LiteLLM" state={integrations.litellm ? "LiteLLM values present · route untested" : integrations.gemini ? "GEMINI_API_KEY present · LiteLLM values required" : "Gemini values required"} text="GEMINI_API_KEY · GEMINI_MODEL · LITELLM_BASE_URL · LITELLM_API_KEY. Keys stay server-side." icon={Activity} /><SetupCard title="Crawl4AI worker" state={integrations.crawler ? "CRAWL4AI_WORKER_URL present · worker untested" : "CRAWL4AI_WORKER_URL required"} text="External registered pages only; access-bypass and stealth modes stay off." icon={Globe2} /><SetupCard title="YouTube / X" state={integrations.youtube || integrations.x ? "Some values present · provider untested" : "Provider access pending"} text="YOUTUBE_API_KEY · X_BEARER_TOKEN. Approved routes and budgets are required before checks." icon={MessageSquareText} /></div><section className="panel env-panel"><div className="panel-heading"><div><div className="eyebrow">SERVER CONFIGURATION</div><h2>Where environment settings live</h2></div><StatusBadge tone="blue">SERVER ONLY</StatusBadge></div><p>For local development, set these names in the workspace root <code>.env</code> beside the registers, then restart the dashboard. In production, set them in the hosting provider secret manager. This page reports whether a value is present; it never sends values to the browser or verifies provider connectivity.</p><code className="env-path">../.env · loaded by the dashboard in local development</code></section><div className="inline-notice warning"><AlertTriangle size={16} /><span>Configuration status only—no secret values are shown. Keys previously pasted in chat must be rotated before production.</span></div></>}

          <footer className="page-footer"><span>MESHDEFEND GTM OS <b>·</b> INTERNAL WORKSPACE</span><span>{data.mode === "seed-preview" ? "Planning register snapshot" : `Updated ${new Date(data.updatedAt).toLocaleString()}`} <b>·</b> External sources only</span></footer>
        </div>
        {reviewPair && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingCoverage) setReviewPair(null); }}><section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><div className="review-dialog-head"><div><div className="eyebrow">COUNTRY PRESENCE REVIEW</div><h2 id="review-title">{reviewPair.competitorName} · {reviewPair.countryCode}</h2></div><button className="icon-button" aria-label="Close review" disabled={savingCoverage} onClick={() => setReviewPair(null)}><X size={17} /></button></div><form onSubmit={saveCoverage}><label className="form-field"><span>Presence status</span><select value={reviewPair.status} onChange={(event) => setReviewPair({ ...reviewPair, status: event.target.value })}><option value="not_reviewed">Not reviewed</option><option value="candidate">Candidate · needs evidence</option><option value="verified_present">Verified present</option><option value="verified_absent">Verified absent</option><option value="disputed">Disputed</option></select></label><label className="form-field"><span>Evidence URL <small>HTTPS only</small></span><input type="url" value={reviewPair.evidenceUrl} onChange={(event) => setReviewPair({ ...reviewPair, evidenceUrl: event.target.value })} placeholder="https://company.example/market-presence" /></label><label className="form-field"><span>Evidence note</span><textarea value={reviewPair.evidenceNote} onChange={(event) => setReviewPair({ ...reviewPair, evidenceNote: event.target.value })} rows={3} placeholder="What supports this country presence decision?" /></label>{coverageError && <div className="form-error">{coverageError}</div>}<div className="review-form-note"><ShieldCheck size={15} /> Verified presence requires a source or evidence note. It does not mark the company as monitored.</div><div className="review-form-actions"><button type="button" className="button-secondary" disabled={savingCoverage} onClick={() => setReviewPair(null)}>Cancel</button><button className="button-primary" disabled={savingCoverage}>{savingCoverage ? "Saving…" : "Save review"}</button></div></form></section></div>}
      </main>
    </div>
  );
}

function MiniMetric({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof LayoutDashboard }) {
  return <article className="mini-metric"><div className="mini-metric-top"><span>{label}</span><Icon size={16} /></div><strong>{value}</strong><small>{detail}</small></article>;
}

function PageTitle({ eyebrow, title, subtitle, badge, badgeTone = "slate" }: { eyebrow: string; title: string; subtitle: string; badge?: string; badgeTone?: "blue" | "green" | "amber" | "slate" | "red" }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>{badge && <StatusBadge tone={badgeTone}>{badge}</StatusBadge>}</div>;
}

function EngineCard({ engine, active }: { engine: typeof inboundEngines[number]; active?: boolean }) {
  const Icon = engine.icon;
  return <article className="engine-card"><div className="engine-card-top"><div className="engine-icon"><Icon size={18} /></div><span className="engine-number">ENGINE {engine.id}</span><StatusBadge tone={active ? "blue" : "slate"}>{active ? "INBOUND" : "LATER"}</StatusBadge></div><h3>{engine.name}</h3><p>{engine.description}</p><div className="engine-outputs"><span>OUTPUTS</span><strong>{engine.outputs}</strong></div><button className="engine-open" disabled>Workspace <ArrowRight size={14} /></button></article>;
}

function RouteCard({ route, large = false }: { route: typeof routes[number]; large?: boolean }) {
  const Icon = route.icon;
  return <article className={`route-card ${large ? "route-card-large" : ""}`}><div className="route-card-top"><span className="route-icon"><Icon size={17} /></span><StatusBadge tone={route.status.startsWith("Selected") ? "blue" : "amber"}>{route.status}</StatusBadge></div><div><strong>{route.name}</strong><small>{route.provider}</small><p>{route.description}</p></div></article>;
}

function CompetitorRow({ company, source }: { company: Competitor; source?: SourceRoute }) {
  const href = safeHref(source?.url || company.url);
  return <tr><td><div className="table-primary"><strong>{company.name}</strong><small>{company.verification === "verified" ? "Identity verified" : "Identity unverified"}</small></div></td><td><span className="source-priority">{company.priorityHint || "Not set"}</span><small>from supplied plan</small></td><td className="focus-cell">{company.focus}</td><td>{href ? <a className="source-link" href={href} target="_blank" rel="noreferrer">Open listed blog <ArrowUpRight size={13} /></a> : "—"}</td><td><div className="table-primary"><strong>{source?.route || "No route registered"}</strong><small>{source?.enabled && source.lastSuccess ? "Successful source check recorded" : "Pending · not monitored"}</small></div></td></tr>;
}

function InfluencerRow({ account }: { account: DashboardData["influencers"][number] }) {
  const href = safeHref(account.profileUrl.startsWith("linkedin.com/") ? "https://" + account.profileUrl : account.profileUrl);
  return <tr><td><div className="table-primary"><strong>{account.name}</strong><small>Person account · LinkedIn</small></div></td><td className="focus-cell">{account.primaryValue}</td><td>{account.evidenceNote}</td><td><StatusBadge tone="slate">Manual review only</StatusBadge></td><td>{href ? <a className="source-link" href={href} target="_blank" rel="noreferrer">Open profile <ArrowUpRight size={13} /></a> : "—"}</td></tr>;
}

function CountryRow({ country, coverage }: { country: Country; coverage?: DashboardData["coverageByCountry"][number] }) {
  return <tr><td><strong>{country.name}</strong></td><td><span className="code-pill">{country.code}</span></td><td>{country.region || "—"}</td><td><span className={"tier-label " + country.tier}>{tiersLabel(country.tier)}</span></td><td>{coverage?.verifiedPresent ?? 0}</td><td>{coverage?.activeSources ?? 0}</td></tr>;
}

function CountryPresenceRow({ company, pair, source, canEdit, onReview }: { company: Competitor; pair?: DashboardData["countryPresence"][number]; source?: SourceRoute; canEdit: boolean; onReview: () => void }) {
  const evidenceHref = safeHref(pair?.evidenceUrl ?? "");
  const sourceHref = safeHref(source?.url || company.url);
  const status = pair?.status ?? "not_reviewed";
  const tone = status === "verified_present" ? "green" : status === "disputed" ? "red" : status === "verified_absent" ? "slate" : "amber";
  const routeState = source?.country
    ? source.enabled && source.lastSuccess ? "Country route checked" : "Country route pending"
    : source ? "Global listing · country route pending" : "No listed route";
  return <tr><td><div className="table-primary"><strong>{company.name}</strong><small>Source priority {company.priorityHint || "—"}</small></div></td><td><StatusBadge tone={tone}>{humanize(status)}</StatusBadge></td><td>{evidenceHref ? <div className="table-primary"><a className="source-link" href={evidenceHref} target="_blank" rel="noreferrer">Open evidence <ArrowUpRight size={13} /></a><small>{pair?.evidenceNote || "Evidence URL recorded"}</small></div> : <span className="text-muted">No country evidence recorded</span>}</td><td><div className="table-primary">{sourceHref ? <a className="source-link" href={sourceHref} target="_blank" rel="noreferrer">Open listed blog <ArrowUpRight size={13} /></a> : <span className="text-muted">No URL listed</span>}<small>{routeState}{source?.route ? " · " + source.route : ""}</small></div></td>{canEdit && <td><button className="table-action" onClick={onReview}>Review</button></td>}</tr>;
}

function TopicRow({ topic }: { topic: Topic }) {
  return <tr><td><strong>{topic.cluster}</strong><small className="topic-id">{topic.id}</small></td><td><span className="country-code-badge">{topic.country}</span><small>{topic.tier}</small></td><td className="focus-cell">{topic.terms}</td><td><small>{topic.scope}</small></td><td><StatusBadge tone="amber">{humanize(topic.validation)}</StatusBadge></td></tr>;
}

function EmptyTable({ text }: { text: string }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={21} /></div><strong>{text}</strong></div>;
}

function SetupCard({ title, state, text, icon: Icon }: { title: string; state: string; text: string; icon: typeof LayoutDashboard }) {
  return <article className="setup-card"><div className="setup-card-top"><span className="foundation-icon"><Icon size={18} /></span><StatusBadge tone="amber">{state}</StatusBadge></div><strong>{title}</strong><p>{text}</p></article>;
}

