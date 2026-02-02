import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod/v4";
import { slugify } from "@/lib/utils";
import { AuditAction } from "@prisma/client";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  teamId: z.string(),
});

// GET - List projects
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  try {
    const projects = await prisma.project.findMany({
      where: {
        team: {
          ...(teamId ? { id: teamId } : {}),
          members: {
            some: { userId: session.user.id },
          },
        },
      },
      include: {
        team: true,
        environments: {
          include: {
            _count: {
              select: { secrets: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, teamId } = createProjectSchema.parse(body);

    // Verify user has access to the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId: session.user.id,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 404 }
      );
    }

    // Generate unique slug
    let slug = slugify(name);
    let counter = 1;
    while (
      await prisma.project.findUnique({
        where: { teamId_slug: { teamId, slug } },
      })
    ) {
      slug = `${slugify(name)}-${counter}`;
      counter++;
    }

    // Create project with default environments
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        teamId,
        environments: {
          create: [
            { name: "Development", slug: "development" },
            { name: "Staging", slug: "staging" },
            { name: "Production", slug: "production" },
          ],
        },
      },
      include: {
        environments: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: AuditAction.PROJECT_CREATE,
        resource: "project",
        resourceId: project.id,
        userId: session.user.id,
        teamId,
        details: { name, slug },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json(
      { message: "Project created successfully", project },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
