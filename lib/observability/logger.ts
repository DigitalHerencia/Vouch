import "server-only"

type LogMetadata = Record<string, unknown>

function writeLog(level: "info" | "warn" | "error", message: string, metadata?: LogMetadata) {
  const entry = {
    level,
    message,
    metadata: metadata ?? {},
    at: new Date().toISOString(),
  }

  if (level === "error") console.error(entry)
  else if (level === "warn") console.warn(entry)
  else console.info(entry)
}

export async function logInfo(message: string, metadata?: LogMetadata): Promise<void> {
  writeLog("info", message, metadata)
}

export async function logWarn(message: string, metadata?: LogMetadata): Promise<void> {
  writeLog("warn", message, metadata)
}

export async function logError(message: string, metadata?: LogMetadata): Promise<void> {
  writeLog("error", message, metadata)
}

export async function logAuditSafe(message: string, metadata?: LogMetadata): Promise<void> {
  writeLog("info", message, metadata)
}
