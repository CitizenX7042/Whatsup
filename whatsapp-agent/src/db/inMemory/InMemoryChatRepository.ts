import type { IChatRepository } from "../interfaces.js";

export class InMemoryChatRepository implements IChatRepository {
  private chats = new Set<string>();

  ensureChat(chatId: string): void {
    this.chats.add(chatId);
  }
}
