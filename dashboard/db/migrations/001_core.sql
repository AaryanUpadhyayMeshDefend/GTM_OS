CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_users (
  entra_oid text PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_user_roles (
  entra_oid text NOT NULL REFERENCES app_users(entra_oid) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'approver')),
  granted_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entra_oid, role)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_approver ON app_user_roles(role) WHERE role = 'approver';

CREATE TABLE IF NOT EXISTS countries (
  iso_alpha2 char(2) PRIMARY KEY,
  country_name text NOT NULL,
  m49_code char(3) NOT NULL,
  iso_alpha3 char(3) NOT NULL,
  global_region text NOT NULL DEFAULT '',
  market_tier text NOT NULL CHECK (market_tier IN ('tier_a', 'tier_c')),
  market_priority text NOT NULL,
  language_status text NOT NULL DEFAULT 'english_only_user_selected',
  discovery_status text NOT NULL DEFAULT 'not_started',
  notes text NOT NULL DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  source_checked_at date
);

CREATE TABLE IF NOT EXISTS competitors (
  id text PRIMARY KEY,
  company_name text NOT NULL,
  source_document text NOT NULL DEFAULT '',
  source_section text NOT NULL DEFAULT '',
  priority_hint text NOT NULL DEFAULT '',
  seed_source_url text NOT NULL DEFAULT '',
  seed_ideas text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'unverified',
  candidate_category text NOT NULL DEFAULT 'unclassified',
  verified_official_domain text NOT NULL DEFAULT '',
  review_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS influencer_accounts (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  primary_value text NOT NULL DEFAULT '',
  source_evidence_note text NOT NULL DEFAULT '',
  profile_url text NOT NULL,
  source_document text NOT NULL DEFAULT '',
  source_section text NOT NULL DEFAULT '',
  collection_route text NOT NULL DEFAULT 'manual_review_only',
  review_status text NOT NULL DEFAULT 'not_reviewed',
  known_gaps text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitor_country_presence (
  competitor_id text NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  country_iso2 char(2) NOT NULL REFERENCES countries(iso_alpha2),
  presence_status text NOT NULL DEFAULT 'not_reviewed'
    CHECK (presence_status IN ('not_reviewed', 'candidate', 'verified_present', 'verified_absent', 'disputed')),
  evidence_url text NOT NULL DEFAULT '',
  evidence_note text NOT NULL DEFAULT '',
  verified_at timestamptz,
  verified_by text,
  PRIMARY KEY (competitor_id, country_iso2)
);

CREATE TABLE IF NOT EXISTS source_routes (
  id text PRIMARY KEY,
  competitor_id text REFERENCES competitors(id) ON DELETE CASCADE,
  country_iso2 char(2) REFERENCES countries(iso_alpha2),
  platform text NOT NULL,
  source_category text NOT NULL DEFAULT '',
  source_url_or_handle text NOT NULL,
  query text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en',
  collection_route text NOT NULL,
  country_relevance_evidence text NOT NULL DEFAULT '',
  rights_or_terms_note text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  confidence text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  coverage_status text NOT NULL DEFAULT 'pending',
  cadence text NOT NULL DEFAULT '',
  terms_note text NOT NULL DEFAULT '',
  known_gaps text NOT NULL DEFAULT '',
  last_checked_at timestamptz,
  last_success_at timestamptz,
  next_check_at timestamptz,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS search_topics (
  id text PRIMARY KEY,
  topic_cluster text NOT NULL,
  seed_terms text NOT NULL,
  country_iso2 char(2) NOT NULL REFERENCES countries(iso_alpha2),
  language text NOT NULL DEFAULT 'en',
  platform_scope text NOT NULL,
  source_basis text NOT NULL DEFAULT '',
  validation_status text NOT NULL DEFAULT 'unvalidated_seed',
  known_gaps text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS source_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_route_id text REFERENCES source_routes(id) ON DELETE SET NULL,
  provider text NOT NULL,
  run_status text NOT NULL CHECK (run_status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  started_at timestamptz,
  finished_at timestamptz,
  result_count integer NOT NULL DEFAULT 0,
  credits_used numeric(12,4) NOT NULL DEFAULT 0,
  error_summary text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_route_id text REFERENCES source_routes(id) ON DELETE SET NULL,
  source_run_id uuid REFERENCES source_runs(id) ON DELETE SET NULL,
  canonical_url text NOT NULL,
  title text NOT NULL DEFAULT '',
  published_at timestamptz,
  observed_at timestamptz NOT NULL DEFAULT now(),
  content_hash text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  country_iso2 char(2) REFERENCES countries(iso_alpha2),
  evidence_state text NOT NULL DEFAULT 'unverified'
    CHECK (evidence_state IN ('confirmed', 'inferred', 'unverified', 'disputed', 'rejected')),
  UNIQUE (canonical_url, content_hash)
);

CREATE TABLE IF NOT EXISTS message_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matrix_version text NOT NULL,
  source_path text NOT NULL,
  section_title text NOT NULL DEFAULT '',
  chunk_text text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  embedding_model text NOT NULL DEFAULT '',
  embedding vector,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id text NOT NULL CHECK (engine_id IN ('01', '02', '03', '04')),
  content_type text NOT NULL,
  title text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'research',
  created_by text REFERENCES app_users(entra_oid),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  body text NOT NULL,
  evidence_ids uuid[] NOT NULL DEFAULT '{}',
  created_by text REFERENCES app_users(entra_oid),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_item_id, version_number)
);

CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_version_id uuid NOT NULL REFERENCES content_versions(id),
  approver_oid text NOT NULL REFERENCES app_users(entra_oid),
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
  note text NOT NULL DEFAULT '',
  decided_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS publish_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_version_id uuid NOT NULL REFERENCES content_versions(id),
  provider text NOT NULL,
  external_id text NOT NULL DEFAULT '',
  canonical_url text NOT NULL DEFAULT '',
  status text NOT NULL CHECK (status IN ('queued', 'succeeded', 'failed')),
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_version_id, provider)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_oid text REFERENCES app_users(entra_oid),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS source_runs_created_idx ON source_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS evidence_observed_idx ON evidence_items(observed_at DESC);
CREATE INDEX IF NOT EXISTS competitor_country_status_idx ON competitor_country_presence(country_iso2, presence_status);
CREATE INDEX IF NOT EXISTS content_state_idx ON content_items(state, updated_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events(created_at DESC);
