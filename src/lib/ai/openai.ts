import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openaiClient: OpenAI | undefined;
};

export const openai =
  globalForOpenAI.openaiClient ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-mock-key-for-development",
  });

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openaiClient = openai;
}

export const DEFAULT_AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Approximate cost calculation per 1M tokens based on standard OpenAI rates
 * GPT-4o-mini: $0.15 / 1M input, $0.60 / 1M output
 */
export function estimateTokenCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  let inputRatePerMillion = 0.15;
  let outputRatePerMillion = 0.6;

  if (model.includes("gpt-4o") && !model.includes("mini")) {
    inputRatePerMillion = 2.5;
    outputRatePerMillion = 10.0;
  }

  const inputCost = (inputTokens / 1_000_000) * inputRatePerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputRatePerMillion;

  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
