import { LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";
import { isEntraConfigured } from "@/auth";
import { LoginButton } from "@/components/login-button";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const configured = isEntraConfigured && Boolean(process.env.DATABASE_URL);
  return <main className="login-page">
    <section className="login-card">
      <div className="login-brand"><span className="brand-symbol"><span /><span /><span /></span><div><strong>meshdefend</strong><small>GTM OPERATING SYSTEM</small></div></div>
      <div className="login-icon"><LockKeyhole size={22} /></div>
      <p className="eyebrow">INTERNAL TEAM WORKSPACE</p>
      <h1>Sign in to GTM OS</h1>
      <p className="login-intro">Use your assigned MeshDefend Microsoft work account to access market intelligence, inbound workflows, and approvals.</p>
      {configured ? <LoginButton /> : <div className="login-setup"><TriangleAlert size={17} /><span>Microsoft Entra and PostgreSQL are not configured. Add the server-side values listed in <code>.env.example</code> before enabling sign-in.</span></div>}
      <div className="login-security"><ShieldCheck size={16} /><span>Single-tenant access · assigned team members only · no public signup</span></div>
      <div className="login-divider" />
      <div className="login-footer"><span>Inbound engines active in this build phase</span><span>Outbound modules are roadmap-only</span></div>
    </section>
    <aside className="login-aside"><div className="login-aside-glow" /><div className="login-aside-content"><span className="aside-kicker">ONE OPERATING SYSTEM</span><h2>Turn market signals into useful action.</h2><p>Monitor competitor and industry activity by country, prepare evidence-backed inbound content, and keep every external action under human approval.</p><div className="aside-points"><div><span>01</span><strong>Listen with evidence</strong></div><div><span>02</span><strong>Prepare original content</strong></div><div><span>03</span><strong>Approve before publishing</strong></div></div><small>Internal MeshDefend workspace · English release</small></div></aside>
  </main>;
}
