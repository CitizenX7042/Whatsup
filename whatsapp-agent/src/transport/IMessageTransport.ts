import type { IncomingMessage, SendMessageResult } from "./types.js";

/**
 * Transport interface - receive and send messages.
 * Implementations: MockConsoleTransport (local testing), WhatsAppBaileysTransport (future).
 */
export interface IMessageTransport {
  /** Start the transport (e.g. connect, start readline loop). */
  start(handler: (message: IncomingMessage) => void | Promise<void>): void | Promise<void>;

  /** Send a reply to a chat. */
  send(chatId: string, text: string): Promise<SendMessageResult>;
}
