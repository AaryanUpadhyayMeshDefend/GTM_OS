import { DashboardShell } from "@/components/dashboard-shell";
import { isEntraConfigured } from "@/auth";
import { requireUser } from "@/lib/authz";
import { getDashboardData } from "@/lib/data";
import { getIntegrationStatus } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireUser();
  const [data, integrations] = await Promise.all([getDashboardData(), Promise.resolve(getIntegrationStatus())]);
  return <DashboardShell data={data} user={user} authConfigured={isEntraConfigured} integrations={integrations} />;
}
