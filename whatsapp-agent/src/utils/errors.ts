/**
 * Base error for the WhatsApp agent.
 * Use for errors that should be handled at the gateway level.
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AgentError";
    Object.setPrototypeOf(this, AgentError.prototype);
  }
}

/**
 * Error when LLM request fails (timeout, API error, etc.).
 */
export class LLMError extends AgentError {
  constructor(message: string, cause?: unknown) {
    super(message, "LLM_ERROR", cause);
    this.name = "LLMError";
  }
}

/**
 * Error when a tool execution fails or is rejected by security policy.
 */
export class ToolError extends AgentError {
  constructor(message: string, cause?: unknown) {
    super(message, "TOOL_ERROR", cause);
    this.name = "ToolError";
  }
}

/**
 * Error when transport (WhatsApp) fails.
 */
export class TransportError extends AgentError {
  constructor(message: string, cause?: unknown) {
    super(message, "TRANSPORT_ERROR", cause);
    this.name = "TransportError";
  }
}
