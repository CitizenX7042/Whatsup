import { loadMemoryFromFiles } from "./memoryLoader.js";
import type { MemoryEntry } from "./types.js";

let cached: MemoryEntry[] | null = null;

/**
 * Get all loaded memory entries. Cached after first load.
 * Call refresh() to reload from disk.
 */
export function getMemory(): MemoryEntry[] {
  if (!cached) {
    cached = loadMemoryFromFiles();
  }
  return cached;
}

/**
 * Force reload of memory from files.
 */
export function refreshMemory(): void {
  cached = null;
  getMemory();
}

/**
 * Format memory entries for inclusion in a prompt.
 */
export function formatMemoryForPrompt(entries: MemoryEntry[]): string {
  if (entries.length === 0) return "";

  const sections = entries.map(
    (e) => `## ${e.source}\n${e.content}`
  );
  return sections.join("\n\n---\n\n");
}
