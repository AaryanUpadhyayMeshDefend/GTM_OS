import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { query } from "@/lib/db";
import type { AppRole, CurrentUser } from "@/lib/types";

export async function requireUser(): Promise<CurrentUser> {
  if (process.env.NODE_ENV !== "production" && process.env.LOCAL_DASHBOARD_PREVIEW === "true") {
    return {
      oid: "local-preview",
      name: "Local Preview",
      email: "",
      roles: ["admin", "approver"],
      preview: true,
    };
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const result = await query<{ display_name: string; email: string; role: AppRole }>(
      `SELECT u.display_name, u.email, r.role
       FROM app_users u JOIN app_user_roles r USING (entra_oid)
       WHERE u.entra_oid = $1 AND u.active = true`,
      [session.user.id],
    );
    if (result.rowCount === 0) redirect("/login?error=access");
    return {
      oid: session.user.id,
      name: result.rows[0].display_name || session.user.name || "MeshDefend team member",
      email: result.rows[0].email || session.user.email || "",
      roles: [...new Set(result.rows.map((row) => row.role))],
    };
  } catch {
    redirect("/login?error=setup");
  }
}

export function hasRole(user: CurrentUser, role: AppRole): boolean {
  return user.roles.includes(role);
}

export function requireRole(user: CurrentUser, role: AppRole): void {
  if (!hasRole(user, role)) throw new Error("Forbidden");
}
