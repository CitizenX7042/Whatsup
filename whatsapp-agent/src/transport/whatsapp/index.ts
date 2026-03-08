/**
 * WhatsApp transport - public interface.
 * Business logic imports from here only. No Baileys types leak.
 */
export { createBaileysSocket, getSocket, registerMessageHandler } from "./baileysClient.js";
export { sendTextMessage } from "./sendMessage.js";
export { registerConnectionEvents } from "./events.js";
export type {
  IncomingMessage,
  SendMessageResult,
  MessageHandler,
  ConnectionStatus,
} from "./types.js";
