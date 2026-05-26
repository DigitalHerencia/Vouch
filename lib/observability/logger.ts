import "server-only"

type LogMetadata = Record<string, unknown>

const REDACTED = "[redacted]"
const CIRCULAR = "[circular]"
const SENSITIVE_KEY_PATTERN =
  /secret|token|session|password|authorization|cookie|api[-_]?key|raw|payload/i

function sanitizeMetadataValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Date) return value.toISOString()
  if (!value || typeof value !== "object") return value
  if (seen.has(value)) return CIRCULAR
  if (Array.isArray(value)) {
    seen.add(value)
    return value.map((item) => sanitizeMetadataValue(item, seen))
  }

  return sanitizeLogMetadata(value as LogMetadata, seen)
}

function sanitizeLogMetadata(metadata: LogMetadata, seen = new WeakSet<object>()): LogMetadata {
  if (seen.has(metadata)) return { value: CIRCULAR }
  seen.add(metadata)

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : sanitizeMetadataValue(value, seen),
    ])
  )
}

function writeLog(level: "info" | "warn" | "error", message: string, metadata?: LogMetadata) {
  const entry = {
    level,
    message,
    metadata: metadata ? sanitizeLogMetadata(metadata) : {},
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
