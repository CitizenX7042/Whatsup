import type { LLMClient, LLMRequest, LLMResponse } from "./types.js";
import { logger } from "../utils/logger.js";

/**
 * Mock LLM client for local testing without an API key.
 * Returns deterministic test responses.
 */
export class MockLlmClient implements LLMClient {
  async complete(request: LLMRequest): Promise<LLMResponse> {
    const lastUser = request.messages
      .filter((m) => m.role === "user")
      .pop();
    const input = lastUser?.content ?? "(no input)";

    const response = `[Mock LLM] You said: "${input.slice(0, 80)}${input.length > 80 ? "..." : ""}". This is a test response.`;
    logger.debug({ inputLength: input.length }, "Mock LLM response generated");

    return {
      content: response,
      model: "mock",
    };
  }
}
