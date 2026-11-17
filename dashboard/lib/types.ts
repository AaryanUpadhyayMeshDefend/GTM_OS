export type AppRole = "admin" | "member" | "approver";

export type CurrentUser = {
  oid: string;
  name: string;
  email: string;
  roles: AppRole[];
  preview?: boolean;
};

export type Country = {
  name: string;
  code: string;
  alpha3: string;
  region: string;
  tier: "tier_a" | "tier_c";
  priority: string;
  discovery: string;
  language: string;
};

export type Competitor = {
  id: string;
  name: string;
  url: string;
  focus: string;
  priorityHint: string;
  verification: string;
  category: string;
  countryStatus: string;
  domain: string;
  notes: string;
};

export type InfluencerAccount = {
  id: string;
  name: string;
  primaryValue: string;
  evidenceNote: string;
  profileUrl: string;
  collectionRoute: string;
  reviewStatus: string;
};

export type Topic = {
  id: string;
  cluster: string;
  terms: string;
  country: string;
  tier: string;
  scope: string;
  validation: string;
  gaps: string;
};

export type SourceRoute = {
  id: string;
  company: string;
  country: string;
  platform: string;
  url: string;
  route: string;
  status: string;
  enabled: boolean;
  lastSuccess: string;
  nextCheck: string;
  gaps: string;
};

export type CountryPresence = {
  competitorId: string;
  countryCode: string;
  status: string;
  evidenceUrl: string;
  evidenceNote: string;
};

export type CountryCoverage = {
  countryCode: string;
  candidateCount: number;
  verifiedPresent: number;
  activeSources: number;
};

export type DashboardData = {
  mode: "database" | "seed-preview";
  updatedAt: string;
  countries: Country[];
  competitors: Competitor[];
  influencers: InfluencerAccount[];
  topics: Topic[];
  sources: SourceRoute[];
  countryPresence: CountryPresence[];
  coverageByCountry: CountryCoverage[];
  summary: {
    pendingApprovals: number;
    recentRuns: number;
    failedRuns: number;
    recentEvidence: number;
  };
};

export type IntegrationStatus = {
  database: boolean;
  serper: boolean;
  gemini: boolean;
  litellm: boolean;
  crawler: boolean;
  youtube: boolean;
  x: boolean;
};
