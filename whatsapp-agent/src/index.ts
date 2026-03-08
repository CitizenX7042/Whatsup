import { createTransport, createRepositories, createGatewayDeps } from "./app/container.js";
import { runStartupDiagnostics } from "./app/startupDiagnostics.js";
import { routeMessage } from "./core/messageRouter.js";
import { registerAllTools } from "./tools/index.js";
import { logger } from "./utils/logger.js";
import { closeConnection } from "./db/azureSql/connection.js";
import { isAzureSqlConfigured } from "./config/env.js";

async function main() {
  logger.info("WhatsApp agent starting");

  registerAllTools();

  const diag = await runStartupDiagnostics();

  if (isAzureSqlConfigured() && !diag.azureSqlConnected) {
    logger.error("Azure SQL is configured but connection failed. Fix configuration and retry.");
    process.exit(1);
  }

  const transport = await createTransport();
  const { chatRepo, messageRepo } = await createRepositories();
  const deps = createGatewayDeps(transport, chatRepo, messageRepo);

  transport.start(async (message) => {
    await routeMessage(message, deps);
  });

  logger.info(
    `Agent ready. Transport=${diag.transport} LLM=${diag.llm} Persistence=${diag.persistence}`
  );
}

main().catch(async (err) => {
  logger.error({ err }, "Fatal error");
  if (isAzureSqlConfigured()) {
    await closeConnection();
  }
  process.exit(1);
});
