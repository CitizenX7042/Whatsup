/**
 * LLM client factory - returns the configured provider.
 * Priority: Azure OpenAI (when configured) > OpenAI > Mock
 */
import { config, useMockLlm, isAzureOpenAIConfigured } from "../config/env.js";
import { MockLlmClient } from "./MockLlmClient.js";
import { createOpenAIProvider } from "./providers/openAIProvider.js";
import { createAzureOpenAIProvider } from "./providers/azureOpenAiProvider.js";
import type { LLMClient } from "./types.js";

let client: LLMClient | null = null;

export function getLLMClient(): LLMClient {
  if (!client) {
    if (useMockLlm()) {
      client = new MockLlmClient();
    } else if (isAzureOpenAIConfigured()) {
      client = createAzureOpenAIProvider();
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