/**
 * Validate that a value is a non-empty string.
 */
export function requireNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Validate that a number is within bounds.
 */
export function requireInRange(
  value: number,
  min: number,
  max: number,
  name: string
): number {
  if (typeof value !== "number" || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return value;
}
