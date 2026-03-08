import { config } from "../config/env.js";

const DANGEROUS_PATTERNS = [
  /sudo/i,
  /rm\s+-rf/i,
  /rm\s+-\*/i,
  /mkfs/i,
  /dd\s+if=/i,
  /chmod\s+[0-7]{3,4}/i,
  /curl\s+.*\|\s*(sh|bash|zsh)/i,
  /wget\s+.*\|\s*(sh|bash|zsh)/i,
  /eval\s+/i,
  /exec\s+/i,
  />\s*\/dev\/null/i,
  /\|\s*tee\s+/i,
  /;\s*rm\s+/i,
  /&&\s*rm\s+/i,
  /\|\s*nc\s+/i,
  /\|\s*ncat\s+/i,
  /ssh\s+/i,
  /scp\s+/i,
  /nc\s+-[el]/i,
];

/**
 * Policy for allowed shell commands.
 * Only allowlisted commands are permitted. No sudo, no destructive ops.
 */
export function isCommandAllowed(rawInput: string): boolean {
  const trimmed = rawInput.trim();
  if (!trimmed) return false;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  if (!cmd) return false;

  return config.allowedCommands.includes(cmd);
}

/**
 * Get the list of allowed commands (for logging/debugging, not for execution).
 */
export function getAllowedCommands(): readonly string[] {
  return config.allowedCommands;
}
