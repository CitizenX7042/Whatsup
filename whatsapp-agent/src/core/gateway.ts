import type { IncomingMessage } from "../transport/types.js";
import type { IChatRepository, IMessageRepository } from "../db/interfaces.js";
import type { LLMClient } from "../llm/types.js";
import { buildContext } from "./contextBuilder.js";
import { buildMessages } from "./promptBuilder.js";
import { logger } from "../utils/logger.js";
import { generateShortId } from "../utils/ids.js";

export interface GatewayDeps {
  chatRepo: IChatRepository;
  messageRepo: IMessageRepository;
  llm: LLMClient;
  sendReply: (chatId: string, text: string) => Promise<void>;
}

/**
 * Gateway: receives messages, orchestrates LLM, sends responses.
 * Depends on abstractions for transport, persistence, and LLM.
 */
export async function handleIncomingMessage(
  message: IncomingMessage,
  deps: GatewayDeps
): Promise<void> {
  const correlationId = generateShortId();
  const logCtx = { msgId: message.id, chatId: message.chatId, correlationId };

  logger.info(logCtx, "Gateway: processing message");

  const context = await buildContext(
    message,
    deps.chatRepo,
    deps.messageRepo
  );

  const messages = buildMessages(context);
  let responseText: string;

  try {
    logger.info(logCtx, "Gateway: LLM request start");
    const response = await deps.llm.complete({ messages });
    responseText = response.content.trim();
    logger.info(logCtx, "Gateway: LLM request end");
  } catch (err) {
    logger.error({ ...logCtx, err }, "Gateway: LLM failed");
    responseText = "Sorry, I couldn't process that. Please try again.";
  }

  await deps.chatRepo.ensureChat(message.chatId);
  const outId = generateShortId();
  await deps.messageRepo.insertMessage(
    outId,
    message.chatId,
    "outgoing",
    responseText
  );

  await deps.sendReply(message.chatId, responseText);
  logger.info(logCtx, "Gateway: reply sent");
}
