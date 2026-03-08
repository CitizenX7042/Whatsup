import { resolve } from "node:path";
import { config } from "../config/env.js";

/**
 * Check if a path is within the allowed directories.
 * Uses canonical resolution to prevent path traversal.
 */
export function isPathAllowed(requestedPath: string): boolean {
  try {
    const resolved = resolve(requestedPath);
    const normalized = resolved.replace(/\\/g, "/");

    for (const allowed of config.allowedPaths) {
      const allowedNormalized = resolve(allowed).replace(/\\/g, "/");
      if (
        normalized === allowedNormalized ||
        normalized.startsWith(allowedNormalized + "/")
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Resolve and validate a path. Returns the resolved path if allowed, else null.
 */
export function resolveAllowedPath(requestedPath: string): string | null {
  try {
    const resolved = resolve(requestedPath);
    return isPathAllowed(resolved) ? resolved : null;
  } catch {
    return null;
  }
}
