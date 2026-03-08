/**
 * Normalized message types used by the gateway.
 * Transport-agnostic - no implementation-specific types.
 */

export interface IncomingMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  rawPayload?: Record<string, unknown>;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
