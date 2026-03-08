export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  execute(input: TInput): Promise<TOutput>;
  /** JSON schema for input validation (optional) */
  inputSchema?: Record<string, unknown>;
}

export type ToolResult = { success: true; data: unknown } | { success: false; error: string };
