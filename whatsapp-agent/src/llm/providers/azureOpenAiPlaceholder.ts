/**
 * Placeholder for Azure OpenAI client.
 *
 * TODO: Implement when ready to use Azure OpenAI:
 * 1. Set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in .env
 * 2. Use fetch to call Azure OpenAI REST API
 * 3. Endpoint format: https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-02-15-preview
 * 4. Header: api-key: <key>
 * 5. Support request timeout and retries
 */
import type { LLMClient, LLMRequest, LLMResponse } from "../types.js";

export class AzureOpenAiClient implements LLMClient {
  async complete(_request: LLMRequest): Promise<LLMResponse> {
    throw new Error(
      "Azure OpenAI client not yet implemented. Use MockLlmClient for local testing."
    );
  }
}
