import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeshDefend GTM OS",
  description: "Secure, evidence-led go-to-market operations for MeshDefend.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
