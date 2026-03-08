import sql from "mssql";
import { config, isAzureSqlConfigured } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

let pool: sql.ConnectionPool | null = null;

function getAzureSqlConfig(): sql.config {
  const cfg = config.azureSql;
  if (!cfg.server || !cfg.database || !cfg.user || !cfg.password) {
    throw new Error(
      "Azure SQL configuration incomplete. Required: AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USER, AZURE_SQL_PASSWORD. " +
      "Leave all unset to use in-memory DB."
    );
  }
  return {
    server: cfg.server,
    database: cfg.database,
    user: cfg.user,
    password: cfg.password,
    port: cfg.port,
    options: {
      encrypt: true,
      trustServerCertificate: cfg.trustServerCertificate,
      enableArithAbort: true,
    },
    connectionTimeout: cfg.connectionTimeout,
    requestTimeout: cfg.requestTimeout,
  };
}

/**
 * Get or create the connection pool.
 * Call only when isAzureSqlConfigured() is true.
 */
export async function getConnectionPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    const sqlConfig = getAzureSqlConfig();
    try {
      pool = await sql.connect(sqlConfig);
      logger.info(
        { server: config.azureSql.server, database: config.azureSql.database },
        "Azure SQL connection established"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(
        { server: config.azureSql.server, database: config.azureSql.database, error: msg },
        "Azure SQL connection failed"
      );
      throw new Error(`Azure SQL connection failed: ${msg}`);
    }
  }
  return pool;
}

/**
 * Verify Azure SQL connectivity. Call at startup when using Azure SQL.
 */
export async function verifyConnection(): Promise<boolean> {
  if (!isAzureSqlConfigured()) return false;
  try {
    const p = await getConnectionPool();
    const result = await p.request().query("SELECT 1 AS ok");
    return result.recordset?.[0]?.ok === 1;
  } catch {
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info("Azure SQL connection closed");
  }
}
