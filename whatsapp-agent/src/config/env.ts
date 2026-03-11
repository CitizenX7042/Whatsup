import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function getEnvOptional(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function resolvePath(value: string): string {
  return resolve(process.cwd(), value);
}

/** Azure SQL is configured when all required vars are present */
export function isAzureSqlConfigured(): boolean {
  const server = (process.env.AZURE_SQL_SERVER ?? "").trim();
  const database = (process.env.AZURE_SQL_DATABASE ?? "").trim();
  const user = (process.env.AZURE_SQL_USER ?? "").trim();
  const password = (process.env.AZURE_SQL_PASSWORD ?? "").trim();
  return !!(server && database && user && password);
}

/** Use in-memory persistence when Azure SQL is not configured */
export function useInMemoryDb(): boolean {
  return !isAzureSqlConfigured();
}

/** Use mock transport (console) when TRANSPORT is not "whatsapp" */
export function useMockTransport(): boolean {
  return getEnvOptional("TRANSPORT", "mock") !== "whatsapp";
}

/** Azure OpenAI is configured when endpoint and apiKey are both present */
export function isAzureOpenAIConfigured(): boolean {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "").trim();
  const apiKey = (process.env.AZURE_OPENAI_API_KEY ?? "").trim();
  return !!(endpoint && apiKey);
}

/** Use mock LLM when no LLM API key is configured (Azure OpenAI or OpenAI) */
export function useMockLlm(): boolean {
  const azureKey = (process.env.AZURE_OPENAI_API_KEY ?? "").trim();
  const openaiKey = (process.env.LLM_API_KEY ?? "").trim();
  return !(azureKey || openaiKey);
}

export const config = {
  llmApiKey: getEnv("LLM_API_KEY", ""),
  llmModel: getEnvOptional("LLM_MODEL", "gpt-4o-mini"),
  llmBaseUrl: getEnvOptional("LLM_BASE_URL", "https://api.openai.com/v1"),
  llmTimeoutMs: parseInt(getEnvOptional("LLM_TIMEOUT_MS", "60000"), 10),
  llmMaxRetries: parseInt(getEnvOptional("LLM_MAX_RETRIES", "3"), 10),

  memoryDir: resolvePath(getEnvOptional("MEMORY_DIR", "./data/memory")),
  authDir: resolvePath(getEnvOptional("AUTH_DIR", "./data/auth")),
  logDir: resolvePath(getEnvOptional("LOG_DIR", "./data/logs")),

  logLevel: getEnvOptional("LOG_LEVEL", "info") as "trace" | "debug" | "info" | "warn" | "error",

  allowedCommands: getEnvOptional("ALLOWED_COMMANDS", "ls,cat,date,pwd,whoami,echo")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean),

  allowedPaths: getEnvOptional("ALLOWED_PATHS", "./data/memory")
    .split(",")
    .map((p) => resolvePath(p.trim()))
    .filter(Boolean),

  azureOpenAI: {
    endpoint: getEnvOptional("AZURE_OPENAI_ENDPOINT", "").trim(),
    apiKey: getEnvOptional("AZURE_OPENAI_API_KEY", "").trim(),
    deployment: getEnvOptional("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini").trim(),
    apiVersion: getEnvOptional("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    timeoutMs: parseInt(getEnvOptional("AZURE_OPENAI_TIMEOUT_MS", "60000"), 10),
    maxRetries: parseInt(getEnvOptional("AZURE_OPENAI_MAX_RETRIES", "3"), 10),
    inputPricePer1M: parseFloat(getEnvOptional("AZURE_OPENAI_INPUT_PRICE_PER_1M", "0.15")) || 0.15,
    outputPricePer1M: parseFloat(getEnvOptional("AZURE_OPENAI_OUTPUT_PRICE_PER_1M", "0.60")) || 0.6,
    cachedInputPricePer1M:
      parseFloat(getEnvOptional("AZURE_OPENAI_CACHED_INPUT_PRICE_PER_1M", "0.075")) || 0.075,
  },

  azureSql: {
    server: getEnvOptional("AZURE_SQL_SERVER", "").trim(),
    database: getEnvOptional("AZURE_SQL_DATABASE", "").trim(),
    user: getEnvOptional("AZURE_SQL_USER", "").trim(),
    password: getEnvOptional("AZURE_SQL_PASSWORD", "").trim(),
    port: parseInt(getEnvOptional("AZURE_SQL_PORT", "1433"), 10),
    trustServerCertificate: getEnvOptional("AZURE_SQL_TRUST_SERVER_CERTIFICATE", "false") === "true",
    connectionTimeout: parseInt(getEnvOptional("AZURE_SQL_CONNECTION_TIMEOUT", "15000"), 10),
    requestTimeout: parseInt(getEnvOptional("AZURE_SQL_REQUEST_TIMEOUT", "15000"), 10),
  },
} as const;
