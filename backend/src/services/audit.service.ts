import { prisma } from '../db';

export const logAudit = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any>,
  ipAddress?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details || {},
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
