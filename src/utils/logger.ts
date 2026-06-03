import { config } from "../config";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private format(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: config.NODE_ENV,
      ...context,
    };

    if (config.NODE_ENV === "production") {
      return JSON.stringify(payload);
    }

    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${payload.timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(this.format("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.format("warn", message, context));
  }

  error(message: string, context?: Record<string, unknown>) {
    console.error(this.format("error", message, context));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (config.NODE_ENV === "development") {
      console.log(this.format("debug", message, context));
    }
  }
}

export const logger = new Logger();
export default logger;
