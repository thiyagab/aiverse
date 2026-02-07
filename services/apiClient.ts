/**
 * Frontend client for AI APIs. All requests go to the backend so API keys
 * (OpenRouter, Gemini, etc.) stay server-side only.
 */
import type { Character, Plot, PlotDraft } from "../types";

const API_BASE = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API ${res.status}`);
  }
  return res.json();
}

export async function generatePlotDetails(input: string): Promise<Partial<PlotDraft>> {
  return post<Partial<PlotDraft>>("/api/plot-details", { input });
}

export async function refinePlot(rawInput: string): Promise<string> {
  if (!rawInput?.trim()) return "";
  const data = await post<{ text: string }>("/api/refine-plot", { rawInput: rawInput.trim() });
  return data.text ?? rawInput;
}

export async function generateDefaultCharacters(draft: PlotDraft): Promise<Partial<Character>[]> {
  return post<Partial<Character>[]>("/api/characters", draft);
}

export async function generateNextEpisode(plot: Plot): Promise<{
  title: string;
  text: string;
  summary: string[];
  memory: string;
  charactersUsed: string[];
}> {
  return post("/api/next-episode", plot);
}
