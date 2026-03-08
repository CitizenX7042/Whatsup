import { getAllTools } from "../tools/registry.js";
import type { ProcessedContext } from "./types.js";
import type { LLMMessage } from "../llm/types.js";

function formatToolsDescription(): string {
  const tools = getAllTools();
  if (tools.length === 0) return "";

  const lines = tools.map(
    (t) => `- ${t.name}: ${t.description}`
  );
  return `\n\nAvailable tools:\n${lines.join("\n")}`;
}

/**
 * Build the system prompt with memory and tool descriptions.
 */
export function buildSystemPrompt(context: ProcessedContext): string {
  let system = `You are a helpful personal WhatsApp assistant. Respond concisely for chat.`;

  if (context.memory) {
    system += `\n\n## Persistent Memory\n${context.memory}`;
  }

  const toolsDesc = formatToolsDescription();
  if (toolsDesc) {
    system += toolsDesc;
  }

  return system;
}

/**
 * Build the full message list for the LLM.
 */
export function buildMessages(context: ProcessedContext): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const messages: LLMMessage[] = [{ role: "system", content: system }];

  for (const h of context.history) {
    messages.push({
      role: h.role,
      content: h.content,
    });
  }

  messages.push({
    role: "user",
    content: context.currentMessage,
  });

  return messages;
}
