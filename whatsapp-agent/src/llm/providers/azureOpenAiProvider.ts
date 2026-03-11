/**
 * Azure OpenAI provider.
 * Uses the Azure OpenAI REST API with api-key authentication.
 */
import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { LLMError } from "../../utils/errors.js";
import { elapsedMs } from "../../utils/time.js";
import type { LLMClient, LLMMessage, LLMRequest, LLMResponse } from "../types.js";

function buildUrl(): string {
  const cfg = config.azureOpenAI;
  const base = cfg.endpoint.replace(/\/$/, "");
  return `${base}/openai/deployments/${encodeURIComponent(cfg.deployment)}/chat/completions?api-version=${cfg.apiVersion}`;
}

export function createAzureOpenAIProvider(): LLMClient {
  return {
    async complete(request: LLMRequest): Promise<LLMResponse> {
      const cfg = config.azureOpenAI;
      if (!cfg.endpoint || !cfg.apiKey) {
        throw new LLMError(
          "Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY."
        );
      }

      const messages = request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body = JSON.stringify({
        messages,
        stream: false,
      });

      const url = buildUrl();
      let lastError: unknown;

      for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);

          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": cfg.apiKey,
            },
            body,
            signal: controller.signal,
          });

          clearTimeout(timeout);
          const latency = elapsedMs(start);

          if (!res.ok) {
            const errText = await res.text();
            logger.warn(
              { status: res.status, attempt, latency },
              "Azure OpenAI request failed"
            );
            throw new LLMError(`Azure OpenAI API error: ${res.status} ${errText}`);
          }

          const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
            model?: string;
            usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
          };

          const content = data.choices?.[0]?.message?.content ?? "";
          logger.info(
            { deployment: cfg.deployment, latency, attempt },
            "Azure OpenAI request completed"
          );

          return {
            content,
            model: data.model ?? cfg.deployment,
            usage: data.usage
              ? {
                  promptTokens: data.usage.prompt_tokens ?? 0,
                  completionTokens: data.usage.completion_tokens ?? 0,
                  totalTokens: data.usage.total_tokens ?? 0,
                }
              : undefined,
          };
        } catch (err) {
          lastError = err;
          if (attempt < cfg.maxRetries) {
            const delay = Math.min(1000 * 2 ** attempt, 10000);
            logger.debug({ attempt, delay }, "Azure OpenAI retry");
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      logger.error({ err: lastError }, "Azure OpenAI request failed after retries");
      throw new LLMError(
        "Azure OpenAI request failed",
        lastError instanceof Error ? lastError : undefined
      );
    },
  };
}
