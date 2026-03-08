import * as readline from "node:readline";
import type { IMessageTransport } from "../IMessageTransport.js";
import type { IncomingMessage, SendMessageResult } from "../types.js";
import { logger } from "../../utils/logger.js";
import { generateShortId } from "../../utils/ids.js";

const MOCK_CHAT_ID = "mock-console-chat";
const MOCK_SENDER_ID = "mock-user";

/**
 * Mock transport for local testing.
 * Reads messages from stdin and prints responses to stdout.
 */
export class MockConsoleTransport implements IMessageTransport {
  private handler: ((message: IncomingMessage) => void | Promise<void>) | null = null;
  private rl: readline.Interface | null = null;

  start(handler: (message: IncomingMessage) => void | Promise<void>): void {
    this.handler = handler;
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    logger.info("Mock transport: type a message and press Enter (Ctrl+C to exit)");
    this.prompt();
    this.rl.on("line", (line) => this.handleLine(line));
  }

  private prompt(): void {
    process.stdout.write("> ");
  }

  private async handleLine(line: string): Promise<void> {
    const text = line.trim();
    if (!text) {
      this.prompt();
      return;
    }

    const message: IncomingMessage = {
      id: generateShortId(),
      chatId: MOCK_CHAT_ID,
      senderId: MOCK_SENDER_ID,
      text,
      timestamp: new Date(),
      rawPayload: { source: "mock-console" },
    };

    if (this.handler) {
      try {
        await this.handler(message);
      } catch (err) {
        logger.error({ err }, "Mock transport: handler error");
      }
    }
    this.prompt();
  }

  async send(chatId: string, text: string): Promise<SendMessageResult> {
    console.log("\n[Agent]", text);
    this.prompt();
    return { success: true, messageId: generateShortId() };
  }
}
