// functions/src/services/auditLog.ts
import * as admin from "firebase-admin";

export type AuditAction =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "api_key.generated"
  | "api_key.regenerated"
  | "api.request"
  | "data.sync.started"
  | "data.sync.completed"
  | "data.sync.failed"
  | "admin.action"
  | "export.requested";

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: admin.firestore.FieldValue;
  success: boolean;
  errorMessage?: string;
}

class AuditLogService {
  private db = admin.firestore();
  private collectionName = "audit_logs";

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    try {
      await this.db.collection(this.collectionName).add({
        ...entry,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log a user action
   */
  async logUserAction(
    action: AuditAction,
    userId: string,
    metadata?: Record<string, unknown>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      action,
      userId,
      metadata,
      success,
      errorMessage,
    });
  }

  /**
   * Log an API request
   */
  async logApiRequest(
    userId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: "api.request",
      userId,
      metadata: {
        endpoint,
        method,
        statusCode,
        duration,
      },
      ip,
      userAgent,
      success: statusCode < 400,
    });
  }

  /**
   * Log a data sync event
   */
  async logDataSync(
    action: "data.sync.started" | "data.sync.completed" | "data.sync.failed",
    triggeredBy: string,
    metadata?: Record<string, unknown>,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      action,
      userId: triggeredBy,
      metadata,
      success: action !== "data.sync.failed",
      errorMessage,
    });
  }

  /**
   * Log API key generation
   */
  async logApiKeyGeneration(
    userId: string,
    isRegeneration: boolean = false
  ): Promise<void> {
    await this.log({
      action: isRegeneration ? "api_key.regenerated" : "api_key.generated",
      userId,
      success: true,
    });
  }

  /**
   * Log data export
   */
  async logExport(
    userId: string,
    format: string,
    recordCount: number,
    filters?: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: "export.requested",
      userId,
      metadata: {
        format,
        recordCount,
        filters,
      },
      success: true,
    });
  }

  /**
   * Query audit logs for a specific user
   */
  async getLogsForUser(
    userId: string,
    limit: number = 50
  ): Promise<admin.firestore.QueryDocumentSnapshot[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs;
  }

  /**
   * Query recent audit logs
   */
  async getRecentLogs(
    limit: number = 100,
    action?: AuditAction
  ): Promise<admin.firestore.QueryDocumentSnapshot[]> {
    let query: admin.firestore.Query = this.db
      .collection(this.collectionName)
      .orderBy("timestamp", "desc")
      .limit(limit);

    if (action) {
      query = query.where("action", "==", action);
    }

    const snapshot = await query.get();
    return snapshot.docs;
  }

  /**
   * Get audit summary for reporting
   */
  async getAuditSummary(
    startDate: Date,
    endDate: Date
  ): Promise<Record<AuditAction, number>> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("timestamp", ">=", startDate)
      .where("timestamp", "<=", endDate)
      .get();

    const summary: Partial<Record<AuditAction, number>> = {};

    for (const doc of snapshot.docs) {
      const action = doc.data().action as AuditAction;
      summary[action] = (summary[action] || 0) + 1;
    }

    return summary as Record<AuditAction, number>;
  }
}

export const auditLogService = new AuditLogService();
