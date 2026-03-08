const SENSITIVE_KEYS = [
  "api_key",
  "apikey",
  "api-key",
  "secret",
  "password",
  "token",
  "auth",
  "authorization",
];

const REDACTED = "[REDACTED]";

/**
 * Redact sensitive values from objects for safe logging.
 */
export function redactSensitive(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitive);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sk) => keyLower.includes(sk));
    result[key] = isSensitive ? REDACTED : redactSensitive(value);
  }
  return result;
}

/**
 * Redact a string that might contain secrets (e.g. API key).
 */
export function redactString(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return REDACTED;
  return value.slice(0, visibleChars) + "…" + REDACTED;
}
