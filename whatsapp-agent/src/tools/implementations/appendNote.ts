import { appendFileSync } from "node:fs";
import { resolveAllowedPath } from "../../security/pathPolicy.js";
import { ToolError } from "../../utils/errors.js";
import type { ToolDefinition } from "../types.js";

const MAX_NOTE_LENGTH = 2000;

export interface AppendNoteInput {
  path: string;
  content: string;
}

export const appendNoteTool: ToolDefinition<AppendNoteInput, string> = {
  name: "append_note",
  description: "Append text to a file. Path must be within allowed directories. Use for notes only.",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string" },
      content: { type: "string" },
    },
    required: ["path", "content"],
  },

  async execute(input: AppendNoteInput): Promise<string> {
    const path = resolveAllowedPath(input.path);
    if (!path) {
      throw new ToolError("Path not allowed by security policy");
    }

    const content = input.content.slice(0, MAX_NOTE_LENGTH);
    if (content.length < input.content.length) {
      throw new ToolError(`Content truncated (max ${MAX_NOTE_LENGTH} chars)`);
    }

    appendFileSync(path, content + "\n", "utf-8");
    return `Appended ${content.length} chars to ${path}`;
  },
};
