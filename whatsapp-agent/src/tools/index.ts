import { registerTool } from "./registry.js";
import { readFileTool } from "./implementations/readFile.js";
import { appendNoteTool } from "./implementations/appendNote.js";
import { listDirTool } from "./implementations/listDir.js";
import { runCommandTool } from "./implementations/runCommand.js";

/**
 * Register all built-in tools. Call once at startup.
 */
export function registerAllTools(): void {
  registerTool(readFileTool);
  registerTool(appendNoteTool);
  registerTool(listDirTool);
  registerTool(runCommandTool);
}

export { executeTool } from "./executor.js";
export { getTool, getAllTools, getToolNames } from "./registry.js";
export type { ToolDefinition, ToolResult } from "./types.js";
