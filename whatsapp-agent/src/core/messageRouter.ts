import { handleIncomingMessage } from "./gateway.js";
import type { IncomingMessage } from "../transport/types.js";
import type { GatewayDeps } from "./gateway.js";

/**
 * Routes incoming messages to the gateway.
 */
export function routeMessage(
  message: IncomingMessage,
  deps: GatewayDeps
): Promise<void> {
  return handleIncomingMessage(message, deps);
}
