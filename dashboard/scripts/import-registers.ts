import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { getPool } from "@/lib/db";

type Row = Record<string, string>;
const root = path.resolve(process.cwd(), "..");

async function csv(file: string): Promise<Row[]> {
  const text = await readFile(path.join(root, file), "utf8");
  return parse(text, { columns: true, skip_empty_lines: true, bom: true }) as Row[];
}

async function main() {
  const [countries, competitors, topics, sources, influencers] = await Promise.all([
    csv("COUNTRY_REGISTER.csv"), csv("COMPETITOR_REGISTER.csv"),
    csv("SEARCH_TOPIC_REGISTER.csv"), csv("COMPETITOR_SOURCE_REGISTER.csv"), csv("INFLUENCER_REGISTER.csv"),
  ]);
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const row of countries) {
      await client.query(
        `INSERT INTO countries
         (iso_alpha2, country_name, m49_code, iso_alpha3, global_region, market_tier, market_priority,
          language_status, discovery_status, notes, source_url, source_checked_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NULLIF($12,'')::date)
         ON CONFLICT (iso_alpha2) DO UPDATE SET country_name=EXCLUDED.country_name,
          m49_code=EXCLUDED.m49_code, iso_alpha3=EXCLUDED.iso_alpha3, global_region=EXCLUDED.global_region,
          market_tier=EXCLUDED.market_tier, market_priority=EXCLUDED.market_priority,
          language_status=EXCLUDED.language_status, discovery_status=EXCLUDED.discovery_status,
          notes=EXCLUDED.notes, source_url=EXCLUDED.source_url, source_checked_at=EXCLUDED.source_checked_at`,
        [row.iso_alpha2, row.country_name, row.m49_code, row.iso_alpha3, row.global_region,
          row.market_tier, row.market_priority, row.language_status, row.competitor_discovery_status,
          row.notes, row.source_url, row.source_checked_at],
      );
    }
    for (const row of competitors) {
      await client.query(
        `INSERT INTO competitors
         (id, company_name, source_document, source_section, priority_hint, seed_source_url, seed_ideas,
          verification_status, candidate_category, verified_official_domain, review_notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET company_name=EXCLUDED.company_name,
          source_document=EXCLUDED.source_document, source_section=EXCLUDED.source_section,
          priority_hint=EXCLUDED.priority_hint, seed_source_url=EXCLUDED.seed_source_url,
          seed_ideas=EXCLUDED.seed_ideas, verification_status=EXCLUDED.verification_status,
          candidate_category=EXCLUDED.candidate_category, verified_official_domain=EXCLUDED.verified_official_domain,
          review_notes=EXCLUDED.review_notes, updated_at=now()`,
        [row.candidate_id, row.company_name, row.source_document, row.source_section,
          row.doc_priority_hint_not_country_tier, row.seed_source_url, row.seed_ideas,
          row.verification_status, row.candidate_category, row.verified_official_domain, row.review_notes],
      );
    }
    await client.query(
      `INSERT INTO competitor_country_presence (competitor_id, country_iso2)
       SELECT c.id, co.iso_alpha2 FROM competitors c CROSS JOIN countries co
       ON CONFLICT (competitor_id, country_iso2) DO NOTHING`,
    );
    for (const row of topics) {
      await client.query(
        `INSERT INTO search_topics
         (id, topic_cluster, seed_terms, country_iso2, language, platform_scope, source_basis, validation_status, known_gaps)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET topic_cluster=EXCLUDED.topic_cluster, seed_terms=EXCLUDED.seed_terms,
          language=EXCLUDED.language, platform_scope=EXCLUDED.platform_scope, source_basis=EXCLUDED.source_basis,
          validation_status=EXCLUDED.validation_status, known_gaps=EXCLUDED.known_gaps`,
        [`${row.topic_id}-${row.country_iso2}`, row.topic_cluster, row.seed_terms, row.country_iso2,
          row.language, row.platform_scope, row.source_basis, row.validation_status, row.known_gaps],
      );
    }
    for (const row of sources) {
      if (!row.source_id || !row.source_url_or_handle) continue;
      await client.query(
        `INSERT INTO source_routes
         (id, competitor_id, country_iso2, platform, source_category, source_url_or_handle, query,
          language, collection_route, country_relevance_evidence, rights_or_terms_note, owner, confidence,
          notes, coverage_status, cadence, last_checked_at, last_success_at, next_check_at, enabled, known_gaps)
         VALUES ($1,NULLIF($2,'')::text,NULLIF($3,'')::char(2),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
          NULLIF($17,'')::timestamptz,NULLIF($18,'')::timestamptz,NULLIF($19,'')::timestamptz,false,$20)
         ON CONFLICT (id) DO UPDATE SET platform=EXCLUDED.platform, source_url_or_handle=EXCLUDED.source_url_or_handle,
          query=EXCLUDED.query, collection_route=EXCLUDED.collection_route, coverage_status=EXCLUDED.coverage_status,
          cadence=EXCLUDED.cadence, known_gaps=EXCLUDED.known_gaps`,
        [row.source_id, row.competitor_id, row.country_iso2, row.platform, row.source_category,
          row.source_url_or_handle, row.scope_or_query, row.language, row.collection_route,
          row.country_relevance_evidence, row.rights_or_terms_note, row.owner, row.confidence, row.notes,
          row.coverage_status, row.cadence, row.last_checked_utc, row.last_success_utc,
          row.next_check_utc, row.known_gaps],
      );
    }
    for (const row of influencers) {
      await client.query(
        `INSERT INTO influencer_accounts
         (id, display_name, primary_value, source_evidence_note, profile_url, source_document,
          source_section, collection_route, review_status, known_gaps)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET display_name=EXCLUDED.display_name,
          primary_value=EXCLUDED.primary_value, source_evidence_note=EXCLUDED.source_evidence_note,
          profile_url=EXCLUDED.profile_url, source_document=EXCLUDED.source_document,
          source_section=EXCLUDED.source_section, collection_route=EXCLUDED.collection_route,
          review_status=EXCLUDED.review_status, known_gaps=EXCLUDED.known_gaps`,
        [row.account_id, row.account_name, row.primary_value, row.source_evidence_note,
          row.profile_url, row.source_document, row.source_section, row.collection_route,
          row.review_status, row.known_gaps],
      );
    }
    await client.query("COMMIT");
    console.log(`Imported ${countries.length} country/area records, ${competitors.length} company seeds, ${topics.length} topic rows, ${sources.length} global source rows, and ${influencers.length} manual-review voices.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Register import failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
