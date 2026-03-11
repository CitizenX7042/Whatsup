import { config, isAzureSqlConfigured, useInMemoryDb, useMockTransport, useMockLlm } from "../config/env.js";
import { loadMemoryFromFiles } from "../memory/memoryLoader.js";
import { verifyConnection } from "../db/azureSql/connection.js";
import { logger } from "../utils/logger.js";

export interface StartupDiagnostics {
  transport: "mock" | "whatsapp";
  llm: "mock" | "openai" | "azure-openai";
  persistence: "in-memory" | "azure-sql";
  azureSqlConfigured: boolean;
  azureSqlConnected: boolean;
  memoryFilesFound: number;
  memoryFiles: string[];
}

export async function runStartupDiagnostics(): Promise<StartupDiagnostics> {
  const transport = useMockTransport() ? "mock" : "whatsapp";
  const persistence = useInMemoryDb() ? "in-memory" : "azure-sql";
  const llm = useMockLlm()
    ? "mock"
    : (config.azureOpenAI.endpoint && config.azureOpenAI.apiKey
        ? "azure-openai"
        : "openai");

  let azureSqlConnected = false;
  if (isAzureSqlConfigured()) {
    try {
      azureSqlConnected = await verifyConnection();
    } catch {
      azureSqlConnected = false;
    }
  }

  const memoryEntries = loadMemoryFromFiles();
  const memoryFiles = memoryEntries.map((e) => e.source);

  const diag: StartupDiagnostics = {
    transport,
    llm,
    persistence,
    azureSqlConfigured: isAzureSqlConfigured(),
    azureSqlConnected,
    memoryFilesFound: memoryEntries.length,
    memoryFiles,
  };

  logDiagnostics(diag);
  return diag;
}

function logDiagnostics(d: StartupDiagnostics): void {
  logger.info(
    {
      transport: d.transport,
      llm: d.llm,
      persistence: d.persistence,
    },
    "Startup: active components"
  );

  if (d.azureSqlConfigured) {
    if (d.azureSqlConnected) {
      logger.info("Startup: Azure SQL connection verified");
    } else {
      logger.error("Startup: Azure SQL connection FAILED - check credentials and firewall");
    }
  } else {
    logger.info("Startup: Azure SQL not configured (using in-memory)");
  }

  if (d.memoryFilesFound > 0) {
    logger.info({ files: d.memoryFiles }, "Startup: memory files loaded");
  } else {
    logger.warn("Startup: no memory files found");
  }
}
