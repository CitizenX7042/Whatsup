import { getMemory, formatMemoryForPrompt } from "../memory/memoryStore.js";
import type { IncomingMessage } from "../transport/types.js";
import type { IChatRepository, IMessageRepository } from "../db/interfaces.js";
import type { ProcessedContext } from "./types.js";
import { generateCorrelationId } from "../utils/ids.js";

/**
 * Build context for the LLM: memory + conversation history + current message.
 * Uses repository interfaces - no direct DB access.
 */
export async function buildContext(
  message: IncomingMessage,
  chatRepo: IChatRepository,
  messageRepo: IMessageRepository
): Promise<ProcessedContext> {
  const correlationId = generateCorrelationId();

  await chatRepo.ensureChat(message.chatId);
  await messageRepo.insertMessage(
    message.id,
    message.chatId,
    "incoming",
    message.text,
    message.rawPayload
  );

  const memoryEntries = getMemory();
  const memory = formatMemoryForPrompt(memoryEntries);

  const recentMessages = await messageRepo.getRecentMessages(message.chatId, 20);
  const history = recentMessages.map((m) => ({
    role: m.direction === "incoming" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }));

  return {
    memory,
    history,
    currentMessage: message.text,
    correlationId,
  };
}
