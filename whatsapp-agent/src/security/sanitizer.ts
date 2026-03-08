/**
 * Sanitize string input to prevent injection in logs or downstream systems.
 * Removes control characters and limits length.
 */
export function sanitizeForLog(input: string, maxLen = 200): string {
  const cleaned = input
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + "…" : cleaned;
}

/**
 * Sanitize command input - no newlines, no semicolons for chaining.
 */
export function sanitizeCommandInput(input: string): string {
  return input
    .replace(/[\n\r;|&$`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
