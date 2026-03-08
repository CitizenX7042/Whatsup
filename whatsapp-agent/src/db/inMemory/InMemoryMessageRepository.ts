import type { IMessageRepository, Message } from "../interfaces.js";

export class InMemoryMessageRepository implements IMessageRepository {
  private messages: Message[] = [];

  insertMessage(
    id: string,
    chatId: string,
    direction: "incoming" | "outgoing",
    text: string,
    rawPayload?: Record<string, unknown>
  ): void {
    this.messages.push({
      id,
      chat_id: chatId,
      direction,
      text,
      raw_payload: rawPayload ? JSON.stringify(rawPayload) : null,
      created_at: new Date().toISOString(),
    });
  }

  getRecentMessages(chatId: string, limit = 20): Message[] {
    const filtered = this.messages
      .filter((m) => m.chat_id === chatId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).
      slice(-limit);
    return filtered;
  }
}
