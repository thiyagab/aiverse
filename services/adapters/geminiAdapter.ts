import { GoogleGenAI, Type, Schema } from "@google/genai";
import type { AIAdapter, GenerateContentOptions, GenerateContentResult } from "./types";

const apiKey = process.env.API_KEY ?? process.env.GEMINI_API_KEY ?? "";
const ai = new GoogleGenAI({ apiKey });

const CREATIVE_MODEL = "gemini-3-flash-preview";
const FAST_MODEL = "gemini-3-flash-preview";

function isRetryableError(error: any): boolean {
  return (
    error?.status === 429 ||
    error?.status === 503 ||
    error?.error?.code === 429 ||
    error?.error?.code === 503 ||
    (typeof error?.message === "string" &&
      (error.message.includes("429") ||
        error.message.includes("503") ||
        error.message.includes("quota") ||
        error.message.includes("RESOURCE_EXHAUSTED") ||
        error.message.includes("overloaded")))
  );
}

async function generateWithRetry(
  model: string,
  params: any,
  retries = 3,
  delay = 2000
): Promise<any> {
  try {
    return await ai.models.generateContent({ model, ...params });
  } catch (error: any) {
    if (retries > 0 && isRetryableError(error)) {
      console.warn(
        `Transient error (${error?.status ?? error?.message}) for ${model}. Retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
      return generateWithRetry(model, params, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Map our generic jsonSchema hint to Gemini Schema (simplified; full schema can be extended).
 * For now we only pass through if it's already a Gemini Schema shape.
 */
function toGeminiConfig(options?: GenerateContentOptions): object | undefined {
  if (!options?.jsonSchema) return undefined;
  const schema = options.jsonSchema as Schema;
  return {
    responseMimeType: "application/json",
    responseSchema: schema,
    ...(options.extra as object),
  };
}

export const geminiAdapter: AIAdapter = {
  name: "gemini",

  async generateContent(
    prompt: string,
    options?: GenerateContentOptions
  ): Promise<GenerateContentResult> {
    const model = options?.model ?? FAST_MODEL;
    const config = toGeminiConfig(options);
    const params = config
      ? { contents: prompt, config }
      : { contents: prompt };

    const response = await generateWithRetry(model, params);
    const text = (response?.text ?? "").trim();
    return { text };
  },
};

export { CREATIVE_MODEL, FAST_MODEL, generateWithRetry };
export type { Schema, Type };
