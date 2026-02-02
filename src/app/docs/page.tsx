import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Terminal, Key, FileCode, Zap, Book } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Lock className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Craig-O-Secrets</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
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

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to get started with Craig-O-Secrets.
            </p>
          </div>

          {/* Quick Start */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Quick Start
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Create an account</h3>
                  <p className="text-muted-foreground">
                    Sign up at{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      craig-o-secrets.vercel.app/register
                    </Link>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Create a project</h3>
                  <p className="text-muted-foreground">
                    Projects organize your secrets by application. Each project
                    has development, staging, and production environments.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Add your secrets</h3>
                  <p className="text-muted-foreground">
                    Add secrets through the dashboard or use our API/CLI for
                    automation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Integrate with your app</h3>
                  <p className="text-muted-foreground">
                    Use our CLI or API to fetch secrets in your CI/CD pipeline or
                    application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Reference */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileCode className="h-6 w-6 text-primary" />
              API Reference
            </h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Authentication</CardTitle>
                  <CardDescription>
                    Use your API key in the Authorization header
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`curl -H "Authorization: Bearer cos_your_api_key" \\
  https://craig-o-secrets.vercel.app/api/v1/secrets`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">List Secrets</CardTitle>
                  <CardDescription>GET /api/v1/secrets</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`# Get all secrets for an environment
curl -H "Authorization: Bearer cos_your_api_key" \\
  "https://craig-o-secrets.vercel.app/api/v1/secrets?environmentId=env_123"

# Response
{
  "secrets": [
    {
      "id": "sec_123",
      "key": "DATABASE_URL",
      "value": "postgresql://...",
      "version": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Secret</CardTitle>
                  <CardDescription>POST /api/v1/secrets</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`curl -X POST \\
  -H "Authorization: Bearer cos_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "API_KEY",
    "value": "sk_live_xxx",
    "description": "Production API key",
    "environmentId": "env_123"
  }' \\
  https://craig-o-secrets.vercel.app/api/v1/secrets`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Secret</CardTitle>
                  <CardDescription>PUT /api/v1/secrets/:id</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`curl -X PUT \\
  -H "Authorization: Bearer cos_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"value": "new_secret_value"}' \\
  https://craig-o-secrets.vercel.app/api/v1/secrets/sec_123`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delete Secret</CardTitle>
                  <CardDescription>DELETE /api/v1/secrets/:id</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`curl -X DELETE \\
  -H "Authorization: Bearer cos_your_api_key" \\
  https://craig-o-secrets.vercel.app/api/v1/secrets/sec_123`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CLI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              CLI Tool
            </h2>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Installation</h3>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`npm install -g craig-o-secrets-cli`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Login</h3>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`cos login
# Enter your API key when prompted`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Pull secrets to .env</h3>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`cos pull --project my-app --env production > .env`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Run with injected secrets</h3>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`cos run --project my-app --env production -- npm start`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Push secrets from .env</h3>
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
{`cos push --project my-app --env development .env`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Keys */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" />
              API Keys
            </h2>

            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  API keys provide programmatic access to your secrets. They begin
                  with <code className="bg-secondary px-2 py-0.5 rounded">cos_</code>.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Create separate keys for different environments</li>
                    <li>Use expiring keys for CI/CD pipelines</li>
                    <li>Rotate keys regularly</li>
                    <li>Never commit keys to source control</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              Need Help?
            </h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
                </p>
                <div className="flex gap-4">
                  <a href="mailto:support@craig-o-secrets.com">
                    <Button variant="outline">Contact Support</Button>
                  </a>
                  <a
                    href="https://github.com/vibecaas/craig-o-secrets"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">GitHub Issues</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
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
