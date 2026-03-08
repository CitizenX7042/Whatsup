import { readdirSync } from "node:fs";
import { resolveAllowedPath } from "../../security/pathPolicy.js";
import { ToolError } from "../../utils/errors.js";
import type { ToolDefinition } from "../types.js";

const MAX_ENTRIES = 100;

export interface ListDirInput {
  path: string;
}

export const listDirTool: ToolDefinition<ListDirInput, string[]> = {
  name: "list_dir",
  description: "List directory contents. Path must be within allowed directories.",
  inputSchema: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },

  async execute(input: ListDirInput): Promise<string[]> {
    const path = resolveAllowedPath(input.path);
    if (!path) {
      throw new ToolError("Path not allowed by security policy");
    }

    const entries = readdirSync(path, { withFileTypes: true });
    const result = entries.slice(0, MAX_ENTRIES).map((e) =>
      e.isDirectory() ? `${e.name}/` : e.name
    );
    return result;
  },
};
