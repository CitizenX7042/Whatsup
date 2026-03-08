export interface Chat {
  id: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  direction: "incoming" | "outgoing";
  text: string;
  raw_payload: string | null;
  created_at: string;
}

export interface IChatRepository {
  ensureChat(chatId: string): void | Promise<void>;
}

export interface IMessageRepository {
  insertMessage(
    id: string,
    chatId: string,
    direction: "incoming" | "outgoing",
    text: string,
    rawPayload?: Record<string, unknown>
  ): void | Promise<void>;

  getRecentMessages(chatId: string, limit?: number): Message[] | Promise<Message[]>;
}
