import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type { MemoryEntry } from "./types.js";

const MEMORY_EXTENSIONS = [".md"];
const DEFAULT_FILES = ["MEMORY.md", "SOUL.md", "PROJECT.md"];

/**
 * Load memory from Markdown files in the memory directory.
 * Add more files to DEFAULT_FILES or place .md files in the memory dir.
 */
export function loadMemoryFromFiles(): MemoryEntry[] {
  const entries: MemoryEntry[] = [];
  const dir = config.memoryDir;

  if (!existsSync(dir)) {
    logger.warn({ dir }, "Memory directory does not exist");
    return entries;
  }

  const files = new Set<string>(DEFAULT_FILES);

  try {
    const dirEntries = readdirSync(dir, { withFileTypes: true });
    for (const e of dirEntries) {
      if (e.isFile() && MEMORY_EXTENSIONS.some((ext) => e.name.endsWith(ext))) {
        files.add(e.name);
      }
    }
  } catch (err) {
    logger.error({ err, dir }, "Failed to read memory directory");
    return entries;
  }

  for (const file of files) {
    const path = join(dir, file);
    if (!existsSync(path)) continue;

    try {
      const content = readFileSync(path, "utf-8").trim();
      if (content) {
        entries.push({ source: file, content });
      }
    } catch (err) {
      logger.warn({ err, file }, "Failed to load memory file");
    }
  }

  return entries;
}
