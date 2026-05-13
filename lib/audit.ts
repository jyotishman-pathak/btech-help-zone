import prisma from "./prisma.client";

interface AuditOptions {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: object;
  newValue?: object;
  ipAddress?: string;
}

export async function audit(options: AuditOptions) {
  try {
    await prisma.auditLog.create({ data: options });
  } catch (e) {
    // Never crash the main operation due to audit failure
    console.error("[audit] failed to write audit log:", e);
  }
}