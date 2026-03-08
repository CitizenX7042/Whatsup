/**
 * LLM client factory - returns the configured provider.
 * Uses MockLlmClient when no API key is set (local testing).
 * OpenAI provider when LLM_API_KEY is set.
 * Placeholder: AzureOpenAiClient when AZURE_OPENAI_API_KEY is set (TODO: implement).
 */
import { config, useMockLlm } from "../config/env.js";
import { MockLlmClient } from "./MockLlmClient.js";
import { createOpenAIProvider } from "./providers/openAIProvider.js";
import { AzureOpenAiClient } from "./providers/azureOpenAiPlaceholder.js";
import type { LLMClient } from "./types.js";

let client: LLMClient | null = null;

export function getLLMClient(): LLMClient {
  if (!client) {
    if (useMockLlm()) {
      client = new MockLlmClient();
    } else if (process.env.AZURE_OPENAI_API_KEY) {
      client = new AzureOpenAiClient();
    } else {
      client = createOpenAIProvider({
        apiKey: config.llmApiKey,
        baseUrl: config.llmBaseUrl,
        model: config.llmModel,
        timeoutMs: config.llmTimeoutMs,
        maxRetries: config.llmMaxRetries,
      });
    }
  }
  return client;
}