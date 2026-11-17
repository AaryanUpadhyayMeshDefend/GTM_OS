import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPool } from "@/lib/db";

async function main() {
  const sql = await readFile(path.join(process.cwd(), "db", "migrations", "001_core.sql"), "utf8");
  await getPool().query(sql);
  console.log("Database schema is ready.");
  await getPool().end();
}

main().catch((error: unknown) => {
  console.error("Database migration failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
