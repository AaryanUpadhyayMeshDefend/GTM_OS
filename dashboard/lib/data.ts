import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { query } from "@/lib/db";
import type { Competitor, Country, CountryCoverage, CountryPresence, DashboardData, InfluencerAccount, SourceRoute, Topic } from "@/lib/types";

type CsvRow = Record<string, string>;
const workspaceRoot = path.resolve(process.cwd(), "..");

async function readCsv(file: string): Promise<CsvRow[]> {
  const content = await readFile(path.join(workspaceRoot, file), "utf8");
  return parse(content, { columns: true, skip_empty_lines: true, bom: true }) as CsvRow[];
}

async function seedPreview(): Promise<DashboardData> {
  const [countryRows, competitorRows, topicRows, influencerRows] = await Promise.all([
    readCsv("COUNTRY_REGISTER.csv"),
    readCsv("COMPETITOR_REGISTER.csv"),
    readCsv("SEARCH_TOPIC_REGISTER.csv"),
    readCsv("INFLUENCER_REGISTER.csv"),
  ]);
  const sourceRows = await readCsv("COMPETITOR_SOURCE_REGISTER.csv");
  const countries: Country[] = countryRows.map((row) => ({
    name: row.country_name,
    code: row.iso_alpha2,
    alpha3: row.iso_alpha3,
    region: row.global_region,
    tier: row.market_tier as Country["tier"],
    priority: row.market_priority,
    discovery: row.competitor_discovery_status,
    language: row.language_status,
  }));
  const competitors: Competitor[] = competitorRows.map((row) => ({
    id: row.candidate_id,
    name: row.company_name,
    url: row.seed_source_url,
    focus: row.seed_ideas,
    priorityHint: row.doc_priority_hint_not_country_tier,
    verification: row.verification_status,
    category: row.candidate_category,
    countryStatus: row.country_scope_status,
    domain: row.verified_official_domain,
    notes: row.review_notes,
  }));
  const topics: Topic[] = topicRows.map((row) => ({
    id: row.topic_id,
    cluster: row.topic_cluster,
    terms: row.seed_terms,
    country: row.country_iso2,
    tier: row.country_tier,
    scope: row.platform_scope,
    validation: row.validation_status,
    gaps: row.known_gaps,
  }));
  const sources: SourceRoute[] = sourceRows.map((row) => ({
    id: row.source_id,
    company: row.competitor_name,
    country: row.country_iso2,
    platform: row.platform,
    url: row.source_url_or_handle,
    route: row.collection_route,
    status: row.coverage_status,
    enabled: false,
    lastSuccess: row.last_success_utc,
    nextCheck: row.next_check_utc,
    gaps: row.known_gaps,
  }));
  const influencers: InfluencerAccount[] = influencerRows.map((row) => ({
    id: row.account_id,
    name: row.account_name,
    primaryValue: row.primary_value,
    evidenceNote: row.source_evidence_note,
    profileUrl: row.profile_url,
    collectionRoute: row.collection_route,
    reviewStatus: row.review_status,
  }));
  const countryPresence: CountryPresence[] = competitors.flatMap((company) => countries.map((country) => ({
    competitorId: company.id,
    countryCode: country.code,
    status: "not_reviewed",
    evidenceUrl: "",
    evidenceNote: "",
  })));
  const coverageByCountry: CountryCoverage[] = countries.map((country) => ({
    countryCode: country.code,
    candidateCount: competitors.length,
    verifiedPresent: 0,
    activeSources: 0,
  }));
  return {
    mode: "seed-preview",
    updatedAt: "2026-11-17",
    countries,
    competitors,
    influencers,
    topics,
    sources,
    countryPresence,
    coverageByCountry,
    summary: { pendingApprovals: 0, recentRuns: 0, failedRuns: 0, recentEvidence: 0 },
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV !== "production" && process.env.LOCAL_DASHBOARD_PREVIEW === "true") {
      return seedPreview();
    }
    throw new Error("DATABASE_URL is required. Use local preview mode only for development.");
  }

  const [countryResult, competitorResult, influencerResult, topicResult, sourceResult, presenceResult, coverageResult, summaryResult] = await Promise.all([
    query<{
      country_name: string; iso_alpha2: string; iso_alpha3: string; global_region: string;
      market_tier: Country["tier"]; market_priority: string; discovery_status: string; language_status: string;
    }>(`SELECT country_name, iso_alpha2, iso_alpha3, global_region, market_tier, market_priority,
               discovery_status, language_status
        FROM countries ORDER BY CASE market_tier WHEN 'tier_a' THEN 0 ELSE 1 END, country_name`),
    query<{
      id: string; company_name: string; seed_source_url: string; seed_ideas: string; priority_hint: string;
      verification_status: string; candidate_category: string; country_scope_status: string;
      verified_official_domain: string; review_notes: string;
    }>(`SELECT id, company_name, seed_source_url, seed_ideas, priority_hint, verification_status, candidate_category,
               '' AS country_scope_status, verified_official_domain, review_notes
        FROM competitors ORDER BY company_name`),
    query<{
      id: string; display_name: string; primary_value: string; source_evidence_note: string;
      profile_url: string; collection_route: string; review_status: string;
    }>(`SELECT id, display_name, primary_value, source_evidence_note, profile_url, collection_route, review_status
        FROM influencer_accounts ORDER BY display_name`),
    query<{
      id: string; topic_cluster: string; seed_terms: string; country_iso2: string; market_tier: string;
      platform_scope: string; validation_status: string; known_gaps: string;
    }>(`SELECT t.id, t.topic_cluster, t.seed_terms, t.country_iso2, c.market_tier, t.platform_scope,
               t.validation_status, t.known_gaps
        FROM search_topics t JOIN countries c ON c.iso_alpha2 = t.country_iso2
        ORDER BY t.topic_cluster, t.country_iso2`),
    query<{
      id: string; company_name: string; country_iso2: string; platform: string; source_url_or_handle: string;
      collection_route: string; coverage_status: string; enabled: boolean; last_success_at: string; next_check_at: string; known_gaps: string;
    }>(`SELECT s.id, COALESCE(c.company_name, 'Industry source') AS company_name, COALESCE(s.country_iso2, '') AS country_iso2,
               s.platform, s.source_url_or_handle, s.collection_route, s.coverage_status, s.enabled,
               s.last_success_at::text, s.next_check_at::text, s.known_gaps
        FROM source_routes s LEFT JOIN competitors c ON c.id = s.competitor_id ORDER BY s.platform, c.company_name`),
    query<{ competitor_id: string; country_iso2: string; presence_status: string; evidence_url: string; evidence_note: string }>(
      `SELECT competitor_id, country_iso2, presence_status, evidence_url, evidence_note
       FROM competitor_country_presence ORDER BY country_iso2, competitor_id`),
    query<{ country_iso2: string; candidate_count: string; verified_present: string; active_sources: string }>(
      `SELECT c.iso_alpha2 AS country_iso2,
         count(DISTINCT p.competitor_id) AS candidate_count,
         count(DISTINCT p.competitor_id) FILTER (WHERE p.presence_status = 'verified_present') AS verified_present,
         count(DISTINCT s.id) FILTER (WHERE s.enabled = true AND s.last_success_at IS NOT NULL) AS active_sources
       FROM countries c
       LEFT JOIN competitor_country_presence p ON p.country_iso2 = c.iso_alpha2
       LEFT JOIN source_routes s ON s.country_iso2 = c.iso_alpha2
       GROUP BY c.iso_alpha2`),
    query<{ pending_approvals: string; recent_runs: string; failed_runs: string; recent_evidence: string }>(
      `SELECT
         (SELECT count(*) FROM content_versions v WHERE NOT EXISTS
           (SELECT 1 FROM approvals a WHERE a.content_version_id = v.id)) AS pending_approvals,
         (SELECT count(*) FROM source_runs WHERE created_at > now() - interval '7 days') AS recent_runs,
         (SELECT count(*) FROM source_runs WHERE run_status = 'failed' AND created_at > now() - interval '7 days') AS failed_runs,
         (SELECT count(*) FROM evidence_items WHERE observed_at > now() - interval '7 days') AS recent_evidence`),
  ]);
  const sum = summaryResult.rows[0];
  return {
    mode: "database",
    updatedAt: new Date().toISOString(),
    countries: countryResult.rows.map((row) => ({
      name: row.country_name, code: row.iso_alpha2, alpha3: row.iso_alpha3, region: row.global_region,
      tier: row.market_tier, priority: row.market_priority, discovery: row.discovery_status, language: row.language_status,
    })),
    competitors: competitorResult.rows.map((row) => ({
      id: row.id, name: row.company_name, url: row.seed_source_url, focus: row.seed_ideas,
      priorityHint: row.priority_hint, verification: row.verification_status, category: row.candidate_category, countryStatus: row.country_scope_status,
      domain: row.verified_official_domain, notes: row.review_notes,
    })),
    influencers: influencerResult.rows.map((row) => ({
      id: row.id, name: row.display_name, primaryValue: row.primary_value, evidenceNote: row.source_evidence_note,
      profileUrl: row.profile_url, collectionRoute: row.collection_route, reviewStatus: row.review_status,
    })),
    topics: topicResult.rows.map((row) => ({
      id: row.id, cluster: row.topic_cluster, terms: row.seed_terms, country: row.country_iso2, tier: row.market_tier,
      scope: row.platform_scope, validation: row.validation_status, gaps: row.known_gaps,
    })),
    sources: sourceResult.rows.map((row) => ({
      id: row.id, company: row.company_name, country: row.country_iso2, platform: row.platform,
      url: row.source_url_or_handle, route: row.collection_route, status: row.coverage_status, enabled: row.enabled,
      lastSuccess: row.last_success_at ?? "", nextCheck: row.next_check_at ?? "", gaps: row.known_gaps,
    })),
    countryPresence: presenceResult.rows.map((row) => ({
      competitorId: row.competitor_id, countryCode: row.country_iso2,
      status: row.presence_status, evidenceUrl: row.evidence_url, evidenceNote: row.evidence_note,
    })),
    coverageByCountry: coverageResult.rows.map((row) => ({
      countryCode: row.country_iso2, candidateCount: Number(row.candidate_count),
      verifiedPresent: Number(row.verified_present), activeSources: Number(row.active_sources),
    })),
    summary: {
      pendingApprovals: Number(sum.pending_approvals), recentRuns: Number(sum.recent_runs),
      failedRuns: Number(sum.failed_runs), recentEvidence: Number(sum.recent_evidence),
    },
  };
}
