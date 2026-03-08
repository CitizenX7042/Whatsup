import { readFileSync, statSync } from "node:fs";
import { resolveAllowedPath } from "../../security/pathPolicy.js";
import { ToolError } from "../../utils/errors.js";
import type { ToolDefinition } from "../types.js";

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_OUTPUT_LENGTH = 8000;

export interface ReadFileInput {
  path: string;
}

export const readFileTool: ToolDefinition<ReadFileInput, string> = {
  name: "read_file",
  description: "Read the contents of a file. Path must be within allowed directories.",
  inputSchema: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },

  async execute(input: ReadFileInput): Promise<string> {
    const path = resolveAllowedPath(input.path);
    if (!path) {
      throw new ToolError("Path not allowed by security policy");
    }

    const stat = statSync(path);
    if (!stat.isFile()) {
      throw new ToolError("Not a file");
    }
    if (stat.size > MAX_FILE_SIZE) {
      throw new ToolError(`File too large (max ${MAX_FILE_SIZE} bytes)`);
    }

    const content = readFileSync(path, "utf-8");
    if (content.length > MAX_OUTPUT_LENGTH) {
      return content.slice(0, MAX_OUTPUT_LENGTH) + "\n...[truncated]";
    }
    return content;
  },
};
