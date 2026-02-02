import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AuditAction, Prisma } from "@prisma/client";

// GET - List audit logs
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const action = searchParams.get("action");
  const resource = searchParams.get("resource");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    // Verify user has access to the team
    if (teamId) {
      const hasAccess = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId: session.user.id,
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    }

    // Build query
    const where: Prisma.AuditLogWhereInput = {};

    if (teamId) {
      where.teamId = teamId;
    } else {
      // Get all teams user belongs to
      const userTeams = await prisma.teamMember.findMany({
        where: { userId: session.user.id },
        select: { teamId: true },
      });
      const teamIds = userTeams.map((t) => t.teamId);

      where.OR = [
        { userId: session.user.id },
        { teamId: { in: teamIds } },
      ];
    }

    if (action && Object.values(AuditAction).includes(action as AuditAction)) {
      where.action = action as AuditAction;
    }

    if (resource) {
      where.resource = resource;
    }

    // Fetch audit logs
    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          team: {
            select: { id: true, name: true, slug: true },
          },
          apiKey: {
            select: { id: true, name: true, keyPrefix: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      auditLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + auditLogs.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
