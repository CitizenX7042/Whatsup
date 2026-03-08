import { getConnectionPool } from "./connection.js";
import type { IChatRepository } from "../interfaces.js";
import { logger } from "../../utils/logger.js";

export class AzureSqlChatRepository implements IChatRepository {
  async ensureChat(chatId: string): Promise<void> {
    const pool = await getConnectionPool();
    try {
      await pool
        .request()
        .input("chatId", chatId)
        .query(
          "IF NOT EXISTS (SELECT 1 FROM chats WHERE id = @chatId) INSERT INTO chats (id) VALUES (@chatId)"
        );
    } catch (err) {
      logger.error({ err, chatId }, "AzureSqlChatRepository.ensureChat failed");
      throw err;
    }
  }
}
