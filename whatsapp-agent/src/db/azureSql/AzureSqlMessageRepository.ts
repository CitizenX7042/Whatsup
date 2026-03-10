import { getConnectionPool } from "./connection.js";
import type { IMessageRepository, Message } from "../interfaces.js";
import { logger } from "../../utils/logger.js";

const MAX_LIMIT = 100;

export class AzureSqlMessageRepository implements IMessageRepository {
  async insertMessage(
    id: string,
    chatId: string,
    direction: "incoming" | "outgoing",
    text: string,
    rawPayload?: Record<string, unknown>
  ): Promise<void> {
    const pool = await getConnectionPool();
    const rawJson = rawPayload ? JSON.stringify(rawPayload) : null;
    try {
      await pool
        .request()
        .input("id", id)
        .input("chatId", chatId)
        .input("direction", direction)
        .input("text", text)
        .input("rawPayload", rawJson)
        .query(
          `INSERT INTO messages (id, chat_id, direction, text, raw_payload)
           VALUES (@id, @chatId, @direction, @text, @rawPayload)`
        );
      logger.info({ id, chatId, direction }, "Azure SQL: insertMessage ok");
    } catch (err) {
      logger.error({ err, id, chatId }, "AzureSqlMessageRepository.insertMessage failed");
      throw err;
    }
  }

  async getRecentMessages(chatId: string, limit = 20): Promise<Message[]> {
    const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
    const pool = await getConnectionPool();
    try {
      const result = await pool
        .request()
        .input("chatId", chatId)
        .query(
          `SELECT TOP (${MAX_LIMIT}) id, chat_id, direction, text, raw_payload, created_at
           FROM messages
           WHERE chat_id = @chatId
           ORDER BY created_at DESC`
        );

      const rows = result.recordset as Array<{
        id: string;
        chat_id: string;
        direction: string;
        text: string;
        raw_payload: string | null;
        created_at: Date;
      }>;

      const limited = rows.slice(0, Math.min(rows.length, safeLimit));
      return limited.reverse().map((r) => ({
        id: r.id,
        chat_id: r.chat_id,
        direction: r.direction as "incoming" | "outgoing",
        text: r.text,
        raw_payload: r.raw_payload,
        created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      }));
    } catch (err) {
      logger.error({ err, chatId }, "AzureSqlMessageRepository.getRecentMessages failed");
      throw err;
    }
  }
}
