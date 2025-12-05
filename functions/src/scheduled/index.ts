
// functions/src/scheduled/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { dataIngestionService } from "../services/dataIngestion";

/**
 * Scheduled function to sync business data weekly
 * Runs every Sunday at 2:00 AM EST
 */
const syncBusinessData = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .pubsub.schedule("0 2 * * 0")
  .timeZone("America/Toronto")
  .onRun(async (context: functions.EventContext) => {
    console.log("Starting scheduled business data sync...");

    try {
      const result = await dataIngestionService.syncAllData();

      console.log("Sync completed successfully:", result);

      // Send notification to admins
      await notifyAdmins("Data Sync Successful", {
        fetched: result.fetched,
        normalized: result.normalized,
        written: result.written,
        deduplicated: result.deduplicated,
        timestamp: new Date().toISOString(),
      });

      return null;
    } catch (error) {
      console.error("Scheduled sync failed:", error);

      // Log error
      await admin.firestore().collection("sync_logs").add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Notify admins of failure
      await notifyAdmins("Data Sync Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  });

/**
 * Clean up old API logs
 * Runs daily at 3:00 AM EST
 * Keeps logs for 30 days
 */
const cleanupOldLogs = functions
  .pubsub.schedule("0 3 * * *")
  .timeZone("America/Toronto")
  .onRun(async (context: functions.EventContext) => {
    console.log("Starting log cleanup...");

    try {
      const db = admin.firestore();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const logsRef = db.collection("api_logs");
      const oldLogs = await logsRef
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .limit(500)
        .get();

      if (oldLogs.empty) {
        console.log("No old logs to delete");
        return null;
      }

      const batch = db.batch();
      oldLogs.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted ${oldLogs.size} old log entries`);

      return null;
    } catch (error) {
      console.error("Log cleanup failed:", error);
      throw error;
    }
  });

/**
 * Reset daily request counters
 * Runs daily at midnight EST
 */
const resetDailyLimits = functions
  .pubsub.schedule("0 0 * * *")
  .timeZone("America/Toronto")
  .onRun(async (context: functions.EventContext) => {
    console.log("Resetting daily request limits...");

    try {
      const db = admin.firestore();
      const usersRef = db.collection("users");
      const snapshot = await usersRef.get();

      let batch = db.batch();
      let count = 0;

      snapshot.docs.forEach((doc, index) => {
        batch.update(doc.ref, {
          requestsToday: 0,
        });
        count++;

        if (count >= 499) {
          batch.commit();
          batch = db.batch();
          count = 0;
        }
      });

      if (count > 0) {
        await batch.commit();
      }

      console.log(`Reset request counters for ${snapshot.size} users`);
      return null;
    } catch (error) {
      console.error("Reset daily limits failed:", error);
      throw error;
    }
  });

/**
 * Generate weekly usage report
 * Runs every Monday at 9:00 AM EST
 */
const weeklyUsageReport = functions
  .pubsub.schedule("0 9 * * 1")
  .timeZone("America/Toronto")
  .onRun(async (context: functions.EventContext) => {
    console.log("Generating weekly usage report...");

    try {
      const db = admin.firestore();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get API logs from the past week
      const logsSnapshot = await db
        .collection("api_logs")
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .get();

      // Calculate statistics
      const stats = {
        totalRequests: logsSnapshot.size,
        uniqueUsers: new Set(logsSnapshot.docs.map((doc) => doc.data().userId)).size,
        avgDuration: 0,
        statusCodes: {} as Record<number, number>,
        topEndpoints: {} as Record<string, number>,
      };

      let totalDuration = 0;

      logsSnapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Duration
        totalDuration += data.duration || 0;

        // Status codes
        const code = data.statusCode || 500;
        stats.statusCodes[code] = (stats.statusCodes[code] || 0) + 1;

        // Endpoints
        const endpoint = data.endpoint || "unknown";
        stats.topEndpoints[endpoint] = (stats.topEndpoints[endpoint] || 0) + 1;
      });

      stats.avgDuration = logsSnapshot.size > 0 ? totalDuration / logsSnapshot.size : 0;

      // Store report
      await db.collection("weekly_reports").add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        weekStarting: admin.firestore.Timestamp.fromDate(sevenDaysAgo),
        stats,
      });

      console.log("Weekly report generated:", stats);

      // Notify admins
      await notifyAdmins("Weekly Usage Report", stats);

      return null;
    } catch (error) {
      console.error("Weekly report generation failed:", error);
      throw error;
    }
  });

/**
 * Helper function to notify admins
 */
async function notifyAdmins(subject: string, data: any): Promise<void> {
  const db = admin.firestore();

  // Store notification
  await db.collection("admin_notifications").add({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    subject,
    data,
    read: false,
  });

  // In production, also send emails or push notifications
  console.log("Admin notification created:", subject);
}

// Export all scheduled functions
export const scheduledFunctions = {
  syncBusinessData,
  cleanupOldLogs,
  resetDailyLimits,
  weeklyUsageReport,
};
