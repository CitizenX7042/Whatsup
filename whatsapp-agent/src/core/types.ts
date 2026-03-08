export interface ProcessedContext {
  memory: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  currentMessage: string;
  correlationId: string;
}
