import type { IncomingMessage } from "../transport/types.js";
import type { IChatRepository, IMessageRepository } from "../db/interfaces.js";
import type { LLMClient } from "../llm/types.js";
import { formatUsageBlock } from "../llm/formatUsage.js";
import { formatCost } from "../llm/costCalculator.js";
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
  let response: Awaited<ReturnType<LLMClient["complete"]>>;

  try {
    logger.info(logCtx, "Gateway: LLM request start");
    response = await deps.llm.complete({ messages });
    logger.info(logCtx, "Gateway: LLM request end");
  } catch (err) {
    logger.error({ ...logCtx, err }, "Gateway: LLM failed");
    response = {
      content: "Sorry, I couldn't process that. Please try again.",
      model: "unknown",
    };
  }

  const responseText = response.content.trim();
  const usageBlock = formatUsageBlock(response);
  const displayText = usageBlock ? `${responseText}${usageBlock}` : responseText;

  if (response.usage) {
    logger.info(
      {
        ...logCtx,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        estimatedCost:
          response.estimatedCost !== undefined
            ? formatCost(response.estimatedCost)
            : undefined,
      },
      "Gateway: token usage"
    );
  }

  await deps.chatRepo.ensureChat(message.chatId);
  const outId = generateShortId();
  await deps.messageRepo.insertMessage(
    outId,
    message.chatId,
    "outgoing",
    responseText
  );

  await deps.sendReply(message.chatId, displayText);
  logger.info(logCtx, "Gateway: reply sent");
}
