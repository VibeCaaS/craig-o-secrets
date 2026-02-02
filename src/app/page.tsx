import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Key, Users, FileText, Zap, Shield, Terminal, History } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Lock className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Craig-O-Secrets</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 mb-6 text-sm">
            <Shield className="h-4 w-4" />
            <span>Enterprise-grade security</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Secrets Management
            <br />
            <span className="text-primary">Done Right</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop sharing secrets in Slack. Craig-O-Secrets provides encrypted storage, 
            team collaboration, audit logs, and seamless integration with your workflow.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Documentation
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            $14/month • Unlimited secrets • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage secrets securely
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Key className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Encrypted Storage</CardTitle>
                <CardDescription>
                  AES-256-GCM encryption for all your secrets. Zero-knowledge architecture.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Team Sharing</CardTitle>
                <CardDescription>
                  Invite team members and control access with fine-grained permissions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  Complete audit trail of who accessed what and when. Stay compliant.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  RESTful API for seamless integration with your CI/CD pipelines.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Terminal className="h-10 w-10 text-primary mb-2" />
                <CardTitle>CLI Tool</CardTitle>
                <CardDescription>
                  Powerful CLI for developers. Inject secrets, sync environments, and more.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <History className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Full version history for all secrets. Roll back to any previous version.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Environment Management</CardTitle>
                <CardDescription>
                  Organize secrets by project and environment. Dev, staging, production.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>SOC 2 Ready</CardTitle>
                <CardDescription>
                  Built with compliance in mind. Audit logs, encryption, and access controls.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$14</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription>Everything you need for secure secrets management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Unlimited secrets",
                  "Unlimited projects",
                  "Team collaboration",
                  "Full audit logs",
                  "API access",
                  "CLI tool",
                  "Version history",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block mt-6">
                <Button className="w-full" size="lg">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span className="font-semibold">Craig-O-Secrets</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">Documentation</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Craig-O-Secrets. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
