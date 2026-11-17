import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { query } from "@/lib/db";

const tenantId = process.env.ENTRA_TENANT_ID;
const clientId = process.env.ENTRA_CLIENT_ID;
const clientSecret = process.env.ENTRA_CLIENT_SECRET;
const accessAppRole = process.env.ENTRA_ACCESS_APP_ROLE ?? "GTM OS Access";
const entraConfigured = Boolean(tenantId && clientId && clientSecret && process.env.AUTH_SECRET);

type EntraProfile = Record<string, unknown> & {
  oid?: string;
  tid?: string;
  roles?: string[];
  name?: string;
  preferred_username?: string;
  email?: string;
};

async function ensureUser(profile: EntraProfile): Promise<boolean> {
  const oid = profile.oid;
  if (!tenantId || profile.tid !== tenantId || !oid) return false;
  if (!Array.isArray(profile.roles) || !profile.roles.includes(accessAppRole)) return false;

  const name = typeof profile.name === "string" ? profile.name : "MeshDefend team member";
  const email = typeof profile.preferred_username === "string"
    ? profile.preferred_username
    : typeof profile.email === "string" ? profile.email : "";

  await query(
    `INSERT INTO app_users (entra_oid, display_name, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (entra_oid) DO UPDATE
     SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, updated_at = now()`,
    [oid, name, email],
  );

  const access = await query<{ active: boolean }>(
    "SELECT active FROM app_users WHERE entra_oid = $1",
    [oid],
  );
  if (!access.rows[0]?.active) return false;

  const defaultRole = process.env.BOOTSTRAP_ADMIN_OID === oid ? "admin" : "member";
  await query(
    "INSERT INTO app_user_roles (entra_oid, role) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [oid, defaultRole],
  );
  if (process.env.APPROVER_ENTRA_OID === oid) {
    await query(
      "INSERT INTO app_user_roles (entra_oid, role) VALUES ($1, 'approver') ON CONFLICT DO NOTHING",
      [oid],
    );
  }
  return true;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: entraConfigured ? [MicrosoftEntraID({
    clientId: clientId!,
    clientSecret: clientSecret!,
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    authorization: { params: { scope: "openid profile email" } },
  })] : [],
  callbacks: {
    async signIn({ profile }) {
      if (!entraConfigured || !profile) return false;
      try {
        return await ensureUser(profile as EntraProfile);
      } catch {
        return false;
      }
    },
    async jwt({ token, profile }) {
      const entra = profile as EntraProfile | undefined;
      if (entra?.oid && entra.tid === tenantId) token.sub = entra.oid;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

export const isEntraConfigured = entraConfigured;
