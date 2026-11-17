# MeshDefend GTM OS

The GTM OS is one authenticated dashboard for the MeshDefend sales/GTM team. Inbound engines 01–04 are the active release. Outbound engines 05–10 are shown in the dashboard roadmap for later; no outbound collection or outreach runs in this release.

## Local dashboard

Requirements: Node.js and npm. Install and run from the app directory:

```powershell
cd dashboard
npm install
npm run dev -- --hostname 127.0.0.1
```

The dashboard reads the workspace-root `.env` during local development. Create it from the root `.env.example` if needed, then fill only the settings you have configured. The app does not send secrets to the browser. The Admin → Team & settings screen shows required variable names and whether values are present; it does not verify provider connectivity.

For a register-only local preview without Microsoft Entra or PostgreSQL, set `LOCAL_DASHBOARD_PREVIEW=true` in the root `.env` and restart the dev server. Preview mode reads the CSV registers and is read-only. Set it back to `false` when finished. It is disabled automatically in production.

## Enable team sign-in

1. Create a single-tenant Microsoft Entra app registration for the MeshDefend organization.
2. Add this local redirect URI: `http://localhost:3000/api/auth/callback/microsoft-entra-id`.
3. Define and assign the `GTM OS Access` app role to approved MeshDefend users/groups. The sign-in callback rejects identities without this role and the expected tenant ID.
4. Set `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, and `AUTH_SECRET` in the root `.env`. Set `BOOTSTRAP_ADMIN_OID` and the one `APPROVER_ENTRA_OID` to immutable Entra object IDs.
5. Provision PostgreSQL with the pgvector extension, then run from `dashboard`:

   ```powershell
   npm run db:migrate
   npm run db:seed
   ```

   The seed imports the planning registers and creates every current competitor-candidate × country pair as unreviewed. Empty source rows are not marked as monitored.

The admin and approver identities, tenant, database URL, hosting target, and approved Sitemap messaging matrix still need to be supplied/configured. Rotate keys previously pasted in chat before any provider API call. Do not deploy until production secrets are in the hosting secret manager.

## Current implementation boundary

The app has the dashboard shell, sign-in gate, server-side role lookup, company and LinkedIn people registers from the supplied inbound document, an evidence-first country matrix, topic/source views, environment status, database schema, and a country-presence review endpoint with audit logging. The supplied document is the sole source for initial account names, URLs, priorities, and themes; external account enrichment is not enabled. Serper, Gemini/LiteLLM, Crawl4AI, YouTube, and X are not yet connected to scheduled collection. RAG, publishing, and outbound actions are not enabled. Do not add monitoring of MeshDefend-owned URLs/posts, GSC, or GA4 to this release.
