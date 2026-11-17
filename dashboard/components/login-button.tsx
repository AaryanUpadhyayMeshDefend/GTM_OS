"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export function LoginButton() {
  return <button className="microsoft-signin" onClick={() => signIn("microsoft-entra-id", { redirectTo: "/" })}>
    <span className="microsoft-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Continue with Microsoft</span><ArrowRight size={16} />
  </button>;
}
