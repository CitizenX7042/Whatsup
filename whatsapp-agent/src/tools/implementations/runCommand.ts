import { exec } from "node:child_process";
import { promisify } from "node:util";
import { isCommandAllowed } from "../../security/commandPolicy.js";
import { sanitizeCommandInput } from "../../security/sanitizer.js";
import { ToolError } from "../../utils/errors.js";
import type { ToolDefinition } from "../types.js";

const execAsync = promisify(exec);
const TIMEOUT_MS = 10000;
const MAX_OUTPUT_LENGTH = 4000;

export interface RunCommandInput {
  command: string;
  args?: string[];
}

/**
 * Heavily restricted command execution.
 * - Allowlist only
 * - Timeout
 * - Max output limit
 * - No sudo, no destructive ops (enforced in commandPolicy)
 */
export const runCommandTool: ToolDefinition<RunCommandInput, string> = {
  name: "run_command",
  description:
    "Run a simple shell command. Only allowlisted commands (ls, cat, date, pwd, whoami, echo). No sudo, no destructive operations.",
  inputSchema: {
    type: "object",
    properties: {
      command: { type: "string" },
      args: { type: "array", items: { type: "string" } },
    },
    required: ["command"],
  },

  async execute(input: RunCommandInput): Promise<string> {
    const cmd = input.args
      ? [input.command, ...input.args].join(" ")
      : input.command;
    const sanitized = sanitizeCommandInput(cmd);

    if (!isCommandAllowed(sanitized)) {
      throw new ToolError(
        "Command not allowed. Check ALLOWED_COMMANDS in .env"
      );
    }

    try {
      const { stdout, stderr } = await execAsync(sanitized, {
        timeout: TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_LENGTH + 1024,
      });

      const output = (stdout + (stderr ? "\n" + stderr : "")).trim();
      if (output.length > MAX_OUTPUT_LENGTH) {
        return output.slice(0, MAX_OUTPUT_LENGTH) + "\n...[truncated]";
      }
      return output || "(no output)";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ToolError(`Command failed: ${msg}`);
    }
  },
};
