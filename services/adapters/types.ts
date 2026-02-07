/**
 * Request options for generateContent.
 * When jsonSchema is provided, the adapter should attempt to return valid JSON (provider-specific).
 */
export interface GenerateContentOptions {
  /** Optional schema hint for structured JSON output (e.g. Gemini uses native schema; OpenRouter uses prompt) */
  jsonSchema?: object;
  /** Model identifier (adapter may map to provider-specific model) */
  model?: string;
  /** Extra provider-specific config (e.g. thinking budget) */
  extra?: Record<string, unknown>;
}

export interface GenerateContentResult {
  text: string;
}

/**
 * Adapter interface for AI providers (Gemini, OpenRouter, etc.).
 * Implement this to add a new provider without changing apiService.
 */
export interface AIAdapter {
  readonly name: string;

  /**
   * Generate content from a prompt. When options.jsonSchema is set, the adapter
   * should return JSON-shaped text when the provider supports it.
   */
  generateContent(
    prompt: string,
    options?: GenerateContentOptions
  ): Promise<GenerateContentResult>;
}
