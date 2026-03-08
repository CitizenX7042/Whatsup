/**
 * Application container - wires implementations based on config.
 * Use mock transport and in-memory DB when Azure SQL / WhatsApp not configured.
 */
import { useInMemoryDb, useMockTransport, isAzureSqlConfigured } from "../config/env.js";
import { MockConsoleTransport } from "../transport/mock/MockConsoleTransport.js";
import { WhatsAppBaileysTransport } from "../transport/whatsapp/placeholder.js";
import { AzureSqlChatRepository } from "../db/azureSql/AzureSqlChatRepository.js";
import { AzureSqlMessageRepository } from "../db/azureSql/AzureSqlMessageRepository.js";
import { InMemoryChatRepository } from "../db/inMemory/InMemoryChatRepository.js";
import { InMemoryMessageRepository } from "../db/inMemory/InMemoryMessageRepository.js";
import { getLLMClient } from "../llm/client.js";
import type { IMessageTransport } from "../transport/IMessageTransport.js";
import type { IChatRepository, IMessageRepository } from "../db/interfaces.js";
import type { GatewayDeps } from "../core/gateway.js";
import { logger } from "../utils/logger.js";

export async function createTransport(): Promise<IMessageTransport> {
  if (useMockTransport()) {
    logger.info("Using MockConsoleTransport");
    return new MockConsoleTransport();
  }
  logger.info("Using WhatsAppBaileysTransport (placeholder)");
  return new WhatsAppBaileysTransport();
}

export async function createRepositories(): Promise<{
  chatRepo: IChatRepository;
  messageRepo: IMessageRepository;
}> {
  if (useInMemoryDb()) {
    logger.info("Using InMemory repositories (Azure SQL not configured)");
    return {
      chatRepo: new InMemoryChatRepository(),
      messageRepo: new InMemoryMessageRepository(),
    };
  }
  if (!isAzureSqlConfigured()) {
    throw new Error("Azure SQL repositories requested but AZURE_SQL_* not configured");
  }
  logger.info("Using Azure SQL repositories");
  return {
    chatRepo: new AzureSqlChatRepository(),
    messageRepo: new AzureSqlMessageRepository(),
  };
}

export function createGatewayDeps(
  transport: IMessageTransport,
  chatRepo: IChatRepository,
  messageRepo: IMessageRepository
): GatewayDeps {
  return {
    chatRepo,
    messageRepo,
    llm: getLLMClient(),
    sendReply: async (chatId, text) => {
      await transport.send(chatId, text);
    },
  };
}
