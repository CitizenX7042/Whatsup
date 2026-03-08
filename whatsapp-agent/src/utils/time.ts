/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Measure elapsed time in milliseconds.
 */
export function elapsedMs(start: number): number {
  return Date.now() - start;
}
