// functions/src/services/logger.ts
import * as admin from "firebase-admin";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: string;
  duration?: number;
}

interface LoggerOptions {
  service: string;
  version?: string;
}

class Logger {
  private service: string;
  private version: string;
  private db = admin.firestore();

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.version = options.version || "1.0.0";
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error, requestId, userId, duration } = entry;

    const parts = [
      `[${timestamp.toISOString()}]`,
      `[${level.toUpperCase()}]`,
      `[${this.service}@${this.version}]`,
    ];

    if (requestId) parts.push(`[req:${requestId}]`);
    if (userId) parts.push(`[user:${userId}]`);
    if (duration !== undefined) parts.push(`[${duration}ms]`);

    parts.push(message);

    if (context && Object.keys(context).length > 0) {
      parts.push(`| ${JSON.stringify(context)}`);
    }

    if (error) {
      parts.push(`| Error: ${error.name}: ${error.message}`);
    }

    return parts.join(" ");
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }

    // Optionally persist error logs to Firestore
    if (level === "error") {
      this.persistLog(entry).catch(console.error);
    }
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      await this.db.collection("error_logs").add({
        ...entry,
        service: this.service,
        version: this.version,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to persist log:", err);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log("error", message, context, error);
  }

  // Create a child logger with request context
  child(context: { requestId?: string; userId?: string }): RequestLogger {
    return new RequestLogger(this, context);
  }
}

class RequestLogger {
  private parent: Logger;
  private requestId?: string;
  private userId?: string;

  constructor(parent: Logger, context: { requestId?: string; userId?: string }) {
    this.parent = parent;
    this.requestId = context.requestId;
    this.userId = context.userId;
  }

  private addContext(context?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...context,
      requestId: this.requestId,
      userId: this.userId,
    };
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent.debug(message, this.addContext(context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.parent.info(message, this.addContext(context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.parent.warn(message, this.addContext(context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.parent.error(message, error, this.addContext(context));
  }
}

// Export singleton instance
export const logger = new Logger({
  service: "bizhub-api",
  version: "1.0.0",
});

export { Logger, RequestLogger };
