import { getTool } from "./registry.js";
import type { ToolResult } from "./types.js";
import { logger } from "../utils/logger.js";
import { ToolError } from "../utils/errors.js";
import { generateShortId } from "../utils/ids.js";

export async function executeTool(
  name: string,
  input: unknown
): Promise<ToolResult> {
  const tool = getTool(name);
  if (!tool) {
    return { success: false, error: `Unknown tool: ${name}` };
  }

  const execId = generateShortId();
  const start = Date.now();

  try {
    logger.info({ tool: name, execId }, "Tool execution start");
    const result = await tool.execute(input);
    logger.info(
      { tool: name, execId, latencyMs: Date.now() - start },
      "Tool execution end"
    );
    return { success: true, data: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ tool: name, execId, err }, "Tool execution failed");
    return { success: false, error: msg };
  }
}
