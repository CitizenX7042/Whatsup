import { formatCost } from "./costCalculator.js";
import type { LLMResponse } from "./types.js";

/**
 * Format usage and cost for display.
 */
export function formatUsageBlock(response: LLMResponse): string {
  const { usage, estimatedCost } = response;
  if (!usage || usage.totalTokens === 0) return "";

  const lines: string[] = [
    "",
    "[Usage]",
    `Prompt tokens: ${usage.promptTokens}`,
    `Completion tokens: ${usage.completionTokens}`,
    `Total tokens: ${usage.totalTokens}`,
  ];

  if (usage.cachedTokens !== undefined && usage.cachedTokens > 0) {
    lines.push(`Cached tokens: ${usage.cachedTokens}`);
  }

  if (estimatedCost !== undefined) {
    lines.push(`Estimated cost: ${formatCost(estimatedCost)}`);
  }

  return lines.join("\n");
}
