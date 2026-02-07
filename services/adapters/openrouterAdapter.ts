import type { AIAdapter, GenerateContentOptions, GenerateContentResult } from "./types";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

function getApiKey(): string {
  return (
    process.env.OPENROUTER_API_KEY ??
    process.env.API_KEY ??
    ""
  ).trim();
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
  delay = 2000
): Promise<Response> {
  const res = await fetch(url, init);
  if (retries > 0 && isRetryableStatus(res.status)) {
    console.warn(`OpenRouter ${res.status}. Retrying in ${delay}ms...`);
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, init, retries - 1, delay * 2);
  }
  return res;
}

/** Default model for OpenRouter (can be overridden via env OPENROUTER_MODEL) */
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

export const openrouterAdapter: AIAdapter = {
  name: "openrouter",

  async generateContent(
    prompt: string,
    options?: GenerateContentOptions
  ): Promise<GenerateContentResult> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("OpenRouter: OPENROUTER_API_KEY or API_KEY is not set.");

    const model =
      process.env.OPENROUTER_MODEL ?? options?.model ?? DEFAULT_MODEL;
    const requestBody: Record<string, unknown> = {
      model,
      messages: [{ role: "user", content: prompt }],
    };

    if (options?.jsonSchema) {
      requestBody.response_format = { type: "json_object" };
      requestBody.max_tokens = 4096;
    }

    const res = await fetchWithRetry(
      OPENROUTER_BASE,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${errText || res.statusText}`);
    }

    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      "";
    const text = typeof content === "string" ? content.trim() : "";
    return { text };
  },
};
