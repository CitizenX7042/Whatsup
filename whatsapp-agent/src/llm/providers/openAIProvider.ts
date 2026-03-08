/**
 * OpenAI-compatible API provider.
 * Works with OpenAI, Azure OpenAI, and other compatible endpoints.
 */
import { logger } from "../../utils/logger.js";
import { LLMError } from "../../utils/errors.js";
import { elapsedMs } from "../../utils/time.js";
import type { LLMClient, LLMMessage, LLMRequest, LLMResponse } from "../types.js";

interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

export function createOpenAIProvider(cfg: OpenAIConfig): LLMClient {
  return {
    async complete(request: LLMRequest): Promise<LLMResponse> {
      const model = request.model ?? cfg.model;
      const timeoutMs = request.timeoutMs ?? cfg.timeoutMs;

      if (!cfg.apiKey) {
        throw new LLMError("LLM_API_KEY is not set");
      }

      const messages = request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body = JSON.stringify({
        model,
        messages,
        stream: false,
      });

      let lastError: unknown;
      for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);

          const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cfg.apiKey}`,
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
              "LLM request failed"
            );
            throw new LLMError(`LLM API error: ${res.status} ${errText}`);
          }

          const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
            model?: string;
            usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
          };

          const content = data.choices?.[0]?.message?.content ?? "";
          logger.info(
            { model, latency, attempt },
            "LLM request completed"
          );

          return {
            content,
            model: data.model ?? model,
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
            logger.debug({ attempt, delay }, "LLM retry");
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      logger.error({ err: lastError }, "LLM request failed after retries");
      throw new LLMError(
        "LLM request failed",
        lastError instanceof Error ? lastError : undefined
      );
    },
  };
}
