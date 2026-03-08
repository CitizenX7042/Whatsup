/**
 * Placeholder for WhatsApp Baileys transport.
 *
 * TODO: Implement when ready to connect WhatsApp:
 * 1. Add @whiskeysockets/baileys dependency
 * 2. Implement IMessageTransport using makeWASocket, useMultiFileAuthState
 * 3. Normalize Baileys messages to IncomingMessage
 * 4. Use sendMessage for replies
 * 5. Wire auth state from data/auth/
 *
 * See original baileysClient.ts, sendMessage.ts, authState.ts for reference.
 */
import type { IMessageTransport } from "../IMessageTransport.js";
import type { IncomingMessage, SendMessageResult } from "../types.js";

export class WhatsAppBaileysTransport implements IMessageTransport {
  async start(_handler: (message: IncomingMessage) => void | Promise<void>): Promise<void> {
    throw new Error("WhatsApp transport not yet implemented. Use MockConsoleTransport for local testing.");
  }

  async send(_chatId: string, _text: string): Promise<SendMessageResult> {
    throw new Error("WhatsApp transport not yet implemented.");
  }
}
