import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Check, Shield } from "lucide-react";

export default function PricingPage() {
  const features = [
    "Unlimited secrets",
    "Unlimited projects",
    "Unlimited environments",
    "Team collaboration",
    "Role-based access control",
    "Full audit logs",
    "RESTful API access",
    "CLI tool included",
    "Version history",
    "AES-256 encryption",
    "Priority support",
    "99.9% uptime SLA",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Lock className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Craig-O-Secrets</span>
          </Link>
          <div className="flex items-center gap-4">
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

      <main className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              One plan, everything included. No hidden fees.
            </p>
          </div>

          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mx-auto mb-4">
                <Shield className="h-4 w-4" />
                Most Popular
              </div>
              <CardTitle className="text-3xl">Pro Plan</CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-4">
                <span className="text-5xl font-bold">$14</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-2">
                Everything you need for secure secrets management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 space-y-3">
                <Link href="/register" className="block">
                  <Button className="w-full" size="lg">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Is there a free trial?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You get 14 days free to try all features. No credit card
                    required to start.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    How secure is Craig-O-Secrets?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We use AES-256-GCM encryption for all secrets. Your data is
                    encrypted at rest and in transit.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I cancel anytime?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Absolutely. Cancel anytime with no questions asked. You&apos;ll
                    have access until the end of your billing period.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Do you offer team pricing?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our Pro plan includes unlimited team members at $14/month
                    total. Contact us for enterprise needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span className="font-semibold">Craig-O-Secrets</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Craig-O-Secrets. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
