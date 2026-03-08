import { randomUUID } from "node:crypto";

/**
 * Generate a unique correlation ID for tracing a request through the system.
 */
export function generateCorrelationId(): string {
  return randomUUID();
}

/**
 * Generate a short ID for message/chat references in logs.
 */
export function generateShortId(): string {
  return randomUUID().slice(0, 8);
}
