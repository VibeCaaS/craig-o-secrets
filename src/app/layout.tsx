import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Craig-O-Secrets | Secure Secrets Management",
  description: "Enterprise-grade secrets management for modern teams. Encrypted storage, team collaboration, audit logs, and API access.",
  keywords: ["secrets management", "environment variables", "encryption", "team collaboration", "API keys"],
  openGraph: {
    title: "Craig-O-Secrets",
    description: "Secure secrets management for modern teams",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
