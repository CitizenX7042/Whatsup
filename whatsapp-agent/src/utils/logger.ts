import pino from "pino";
import { config } from "../config/env.js";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: config.logLevel,
  transport:
    isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  base: undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export type Logger = typeof logger;
