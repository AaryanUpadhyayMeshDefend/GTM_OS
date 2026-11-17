import type { IntegrationStatus } from "@/lib/types";

export function getIntegrationStatus(): IntegrationStatus {
  return {
    database: Boolean(process.env.DATABASE_URL),
    serper: Boolean(process.env.SERPER_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    litellm: Boolean(process.env.LITELLM_BASE_URL && process.env.LITELLM_API_KEY),
    crawler: Boolean(process.env.CRAWL4AI_WORKER_URL),
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
    x: Boolean(process.env.X_BEARER_TOKEN),
  };
}
