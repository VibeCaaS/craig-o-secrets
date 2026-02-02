import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { encrypt, decrypt, hashApiKey } from "@/lib/encryption";
import { z } from "zod/v4";
import { AuditAction } from "@prisma/client";

const updateSecretSchema = z.object({
  value: z.string().optional(),
  description: z.string().optional(),
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

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { user: apiKey.user, apiKey };
}

// GET - Get single secret
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const apiKeyAuth = !session ? await verifyApiKey(req) : null;

  const userId = session?.user?.id || apiKeyAuth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const secret = await prisma.secret.findFirst({
      where: {
        id,
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
          include: { project: true },
        },
        history: {
          orderBy: { version: "desc" },
          take: 10,
        },
      },
    });

    if (!secret) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: AuditAction.SECRET_READ,
        resource: "secret",
        resourceId: secret.id,
        userId,
        teamId: secret.environment.project.teamId,
        apiKeyId: apiKeyAuth?.apiKey?.id,
        details: { key: secret.key },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      secret: {
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
        history: secret.history.map((h) => ({
          version: h.version,
          createdAt: h.createdAt,
          changedBy: h.changedBy,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update secret
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const apiKeyAuth = !session ? await verifyApiKey(req) : null;

  const userId = session?.user?.id || apiKeyAuth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { value, description } = updateSecretSchema.parse(body);

    // Find the secret and verify access
    const existingSecret = await prisma.secret.findFirst({
      where: {
        id,
        environment: {
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
      },
      include: {
        environment: {
          include: { project: true },
        },
      },
    });

    if (!existingSecret) {
      return NextResponse.json(
        { error: "Secret not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      description?: string;
      encryptedValue?: string;
      iv?: string;
      version?: { increment: number };
    } = {};

    if (description !== undefined) {
      updateData.description = description;
    }

    if (value !== undefined) {
      // Save current version to history
      await prisma.secretHistory.create({
        data: {
          secretId: existingSecret.id,
          encryptedValue: existingSecret.encryptedValue,
          iv: existingSecret.iv,
          version: existingSecret.version,
          changedBy: userId,
        },
      });

      // Encrypt new value
      const { encryptedValue, iv } = encrypt(value);
      updateData.encryptedValue = encryptedValue;
      updateData.iv = iv;
      updateData.version = { increment: 1 };
    }

    // Update secret
    const updatedSecret = await prisma.secret.update({
      where: { id },
      data: updateData,
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: AuditAction.SECRET_UPDATE,
        resource: "secret",
        resourceId: updatedSecret.id,
        userId,
        teamId: existingSecret.environment.project.teamId,
        apiKeyId: apiKeyAuth?.apiKey?.id,
        details: { key: updatedSecret.key, valueChanged: value !== undefined },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      message: "Secret updated successfully",
      secret: {
        id: updatedSecret.id,
        key: updatedSecret.key,
        description: updatedSecret.description,
        version: updatedSecret.version,
        updatedAt: updatedSecret.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete secret
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const apiKeyAuth = !session ? await verifyApiKey(req) : null;

  const userId = session?.user?.id || apiKeyAuth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Find the secret and verify access
    const secret = await prisma.secret.findFirst({
      where: {
        id,
        environment: {
          project: {
            team: {
              members: {
                some: {
                  userId,
                  role: { in: ["OWNER", "ADMIN"] },
                },
              },
            },
          },
        },
      },
      include: {
        environment: {
          include: { project: true },
        },
      },
    });

    if (!secret) {
      return NextResponse.json(
        { error: "Secret not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the secret
    await prisma.secret.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: AuditAction.SECRET_DELETE,
        resource: "secret",
        resourceId: id,
        userId,
        teamId: secret.environment.project.teamId,
        apiKeyId: apiKeyAuth?.apiKey?.id,
        details: { key: secret.key },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ message: "Secret deleted successfully" });
  } catch (error) {
    console.error("Error deleting secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
