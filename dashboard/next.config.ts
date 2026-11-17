import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

export default async function nextConfig(phase: string): Promise<NextConfig> {
  if (phase === "phase-development-server") loadEnvConfig(path.resolve(process.cwd(), ".."));
  return { poweredByHeader: false };
}
