import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { encrypt, decrypt, hashApiKey } from "@/lib/encryption";
import { z } from "zod/v4";
import { AuditAction } from "@prisma/client";

const createSecretSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string(),
  description: z.string().optional(),
  environmentId: z.string(),
});

// Helper to verify API key
async function verifyApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const keyHash = hashApiKey(token);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { user: apiKey.user, apiKey };
}

// GET - List secrets
export async function GET(req: NextRequest) {
  // Try session auth first, then API key
  const session = await auth();
  const apiKeyAuth = !session ? await verifyApiKey(req) : null;

  const userId = session?.user?.id || apiKeyAuth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const environmentId = searchParams.get("environmentId");
  const projectId = searchParams.get("projectId");

  try {
    // Build query based on parameters
    let where: Record<string, unknown> = {};
    
    if (environmentId) {
      where.environmentId = environmentId;
    } else if (projectId) {
      where.environment = {
        projectId,
      };
    }

    // Verify user has access to the environment
    const secrets = await prisma.secret.findMany({
      where: {
        ...where,
        environment: {
          project: {
            team: {
              members: {
                some: { userId },
              },
            },
          },
        },
      },
      include: {
        environment: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { key: "asc" },
    });

    // Decrypt values for response
    const decryptedSecrets = secrets.map((secret) => ({
      id: secret.id,
      key: secret.key,
      value: decrypt(secret.encryptedValue, secret.iv),
      description: secret.description,
      version: secret.version,
      environmentId: secret.environmentId,
      environment: secret.environment.name,
      project: secret.environment.project.name,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    }));

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: AuditAction.SECRET_READ,
        resource: "secret",
        resourceId: environmentId || projectId || "all",
        userId,
        apiKeyId: apiKeyAuth?.apiKey?.id,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ secrets: decryptedSecrets });
  } catch (error) {
    console.error("Error fetching secrets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create secret
export async function POST(req: NextRequest) {
  const session = await auth();
  const apiKeyAuth = !session ? await verifyApiKey(req) : null;

  const userId = session?.user?.id || apiKeyAuth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { key, value, description, environmentId } = createSecretSchema.parse(body);

    // Verify user has access to the environment
    const environment = await prisma.environment.findFirst({
      where: {
        id: environmentId,
        project: {
          team: {
            members: {
              some: {
                userId,
                role: { in: ["OWNER", "ADMIN", "MEMBER"] },
              },
            },
          },
        },
      },
      include: {
        project: {
          include: { team: true },
        },
      },
    });

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found or access denied" },
        { status: 404 }
      );
    }

    // Check if secret with this key already exists
    const existingSecret = await prisma.secret.findUnique({
      where: {
        environmentId_key: {
          environmentId,
          key,
        },
      },
    });

    if (existingSecret) {
      return NextResponse.json(
        { error: "Secret with this key already exists" },
        { status: 409 }
      );
    }

    // Encrypt the value
    const { encryptedValue, iv } = encrypt(value);

    // Create the secret
    const secret = await prisma.secret.create({
      data: {
        key,
        encryptedValue,
        iv,
        description,
        environmentId,
        userId,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: AuditAction.SECRET_CREATE,
        resource: "secret",
        resourceId: secret.id,
        userId,
        teamId: environment.project.teamId,
        apiKeyId: apiKeyAuth?.apiKey?.id,
        details: { key, environment: environment.name, project: environment.project.name },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json(
      {
        message: "Secret created successfully",
        secret: {
          id: secret.id,
          key: secret.key,
          description: secret.description,
          version: secret.version,
          createdAt: secret.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
