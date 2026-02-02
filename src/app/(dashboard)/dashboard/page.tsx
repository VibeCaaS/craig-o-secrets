import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FolderKey, Users, FileText, Plus, Key, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's teams, projects, and stats
  const [teams, recentSecrets, recentAuditLogs] = await Promise.all([
    prisma.team.findMany({
      where: {
        members: {
          some: { userId: session.user.id },
        },
      },
      include: {
        _count: {
          select: { projects: true, members: true },
        },
        projects: {
          include: {
            environments: {
              include: {
                _count: {
                  select: { secrets: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.secret.findMany({
      where: {
        environment: {
          project: {
            team: {
              members: {
                some: { userId: session.user.id },
              },
            },
          },
        },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        environment: {
          include: {
            project: true,
          },
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            team: {
              members: {
                some: { userId: session.user.id },
              },
            },
          },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  // Calculate stats
  const totalProjects = teams.reduce((acc, team) => acc + team._count.projects, 0);
  const totalSecrets = teams.reduce(
    (acc, team) =>
      acc +
      team.projects.reduce(
        (pacc, project) =>
          pacc +
          project.environments.reduce(
            (eacc, env) => eacc + env._count.secrets,
            0
          ),
        0
      ),
    0
  );
  const totalTeamMembers = teams.reduce((acc, team) => acc + team._count.members, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Craig-O-Secrets</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/api-keys">
              <Button variant="ghost" size="sm">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </Button>
            </Link>
            <Link href="/dashboard/audit-logs">
              <Button variant="ghost" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Audit Logs
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name || "there"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your secrets securely across all your projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Teams</CardDescription>
              <CardTitle className="text-3xl">{teams.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Projects</CardDescription>
              <CardTitle className="text-3xl">{totalProjects}</CardTitle>
            </CardHeader>
            <CardContent>
              <FolderKey className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Secrets</CardDescription>
              <CardTitle className="text-3xl">{totalSecrets}</CardTitle>
            </CardHeader>
            <CardContent>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Team Members</CardDescription>
              <CardTitle className="text-3xl">{totalTeamMembers}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Teams & Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Teams</h2>
              <Link href="/dashboard/teams/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Team
                </Button>
              </Link>
            </div>

            {teams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No teams yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a team to start organizing your secrets.
                  </p>
                  <Link href="/dashboard/teams/new">
                    <Button>Create Your First Team</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>
                            {team._count.projects} projects • {team._count.members} members
                          </CardDescription>
                        </div>
                        <Link href={`/dashboard/teams/${team.slug}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    {team.projects.length > 0 && (
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {team.projects.slice(0, 4).map((project) => (
                            <Link
                              key={project.id}
                              href={`/dashboard/projects/${project.slug}`}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                            >
                              <FolderKey className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                {project.name}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {project.environments.reduce(
                                  (acc, env) => acc + env._count.secrets,
                                  0
                                )}{" "}
                                secrets
                              </span>
                            </Link>
                          ))}
                        </div>
                        {team.projects.length === 0 && (
                          <Link href={`/dashboard/projects/new?team=${team.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Project
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Card>
              <CardContent className="p-4">
                {recentAuditLogs.length === 0 ? (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">
                            <span className="font-medium">
                              {log.user?.name || "System"}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {log.action.toLowerCase().replace(/_/g, " ")}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <Card>
              <CardContent className="p-4 space-y-2">
                <Link href="/dashboard/projects/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FolderKey className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </Link>
                <Link href="/dashboard/api-keys" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Keys
                  </Button>
                </Link>
                <Link href="/docs" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
