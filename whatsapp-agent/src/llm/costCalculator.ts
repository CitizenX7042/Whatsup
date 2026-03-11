/**
 * Cost estimation for Azure OpenAI requests.
 * Uses configurable pricing from environment variables.
 */

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

export interface CostResult {
  estimatedCost: number;
  promptCost: number;
  completionCost: number;
  cachedCost?: number;
}

/**
 * Compute estimated cost from token usage and pricing (per 1M tokens).
 * Cached tokens use cached price when available; otherwise counted as prompt tokens.
 */
export function estimateCost(
  usage: TokenUsage,
  inputPricePer1M: number,
  outputPricePer1M: number,
  cachedPricePer1M?: number
): CostResult {
  const cachedTokens = usage.cachedTokens ?? 0;
  const nonCachedPromptTokens = Math.max(0, usage.promptTokens - cachedTokens);

  const promptCost = (nonCachedPromptTokens / 1_000_000) * inputPricePer1M;
  const completionCost = (usage.completionTokens / 1_000_000) * outputPricePer1M;
  const cachedCost =
    cachedTokens > 0 && cachedPricePer1M !== undefined
      ? (cachedTokens / 1_000_000) * cachedPricePer1M
      : cachedTokens > 0
        ? (cachedTokens / 1_000_000) * inputPricePer1M
        : undefined;

  const estimatedCost = promptCost + completionCost + (cachedCost ?? 0);

  return {
    estimatedCost,
    promptCost,
    completionCost,
    cachedCost,
  };
}

/**
 * Format cost as USD string (e.g. "$0.000123").
 * Rounds to 6 decimal places to avoid floating-point display issues.
 */
export function formatCost(cost: number): string {
  const rounded = Math.round(cost * 1e6) / 1e6;
  return `$${rounded.toFixed(6)}`;
}
