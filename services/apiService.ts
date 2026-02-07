import { Type, Schema } from "@google/genai";
import { Character, Plot, PlotDraft } from "../types";
import type { AIAdapter } from "./adapters/types";
import { geminiAdapter, CREATIVE_MODEL, FAST_MODEL } from "./adapters/geminiAdapter";
import { openrouterAdapter } from "./adapters/openrouterAdapter";

// --- Adapter selection (extend by adding new adapters and env check) ---
const PROVIDER = (process.env.AI_PROVIDER ?? process.env.VITE_AI_PROVIDER ?? "gemini").toLowerCase();
const adapters: Record<string, AIAdapter> = {
  gemini: geminiAdapter,
  openrouter: openrouterAdapter,
};
const adapter: AIAdapter = adapters[PROVIDER] ?? geminiAdapter;

// --- Shared prompts & schemas (Gemini Schema format; OpenRouter uses JSON instruction in prompt) ---
export const WRITING_STYLES = [
  "Novel",
  "Plain English",
  "Casual",
  "Literary",
  "South Indian English",
  "North Indian English",
];

const plotDetailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    genre: { type: Type.STRING },
    writingStyle: { type: Type.STRING, enum: WRITING_STYLES },
    setting: { type: Type.STRING },
    plot: { type: Type.STRING, description: "2–4 sentence story summary / refined plot" },
    rules: { type: Type.STRING },
    objective: { type: Type.STRING },
    episodeLength: { type: Type.INTEGER },
  },
  required: ["title", "genre", "writingStyle", "setting", "plot", "rules", "objective", "episodeLength"],
};

const characterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          traits: { type: Type.ARRAY, items: { type: Type.STRING } },
          speakingStyle: { type: Type.STRING },
          motivation: { type: Type.STRING },
          secret: { type: Type.STRING },
          relationships: { type: Type.STRING },
          characterization: { type: Type.STRING },
        },
        required: ["name", "role", "traits", "speakingStyle", "motivation", "characterization"],
      },
    },
  },
};

const episodeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    episodeTitle: { type: Type.STRING },
    episodeText: { type: Type.STRING },
    episodeSummary: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 distinct bullet points summarizing events",
    },
    storyMemory: {
      type: Type.STRING,
      description: "Updated running summary of the entire plot so far.",
    },
    charactersUsed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of names of characters who appeared",
    },
  },
  required: ["episodeTitle", "episodeText", "episodeSummary", "storyMemory", "charactersUsed"],
};

// --- Plot details ---
export const generatePlotDetails = async (input: string): Promise<Partial<PlotDraft>> => {
  const prompt = `
    You are a master storyteller.
    Analyze the following user input, which might be a specific Genre OR a raw Story Concept:
    "${input}"

    Based on this, create a unique, complete story foundation.
    
    1. If the input is a description (e.g., "cowboys vs aliens"), infer the best fitting Genre.
    2. Fill in the following details:
    - Title: Catchy title.
    - Genre: The specific genre string.
    - writingStyle: One of [${WRITING_STYLES.join(", ")}] — complexity and style of language (e.g. Novel = rich prose, Plain English = clear and simple, South Indian English = Indian English with South Indian flavour).
    - Setting: Vivid time and place.
    - plot: A 2–4 sentence story summary / refined plot (the main story in brief).
    - Rules of the World: 1-2 unique laws/mechanics.
    - Story Objective: Ultimate goal.
    - Episode Length: EXACTLY one of: 300, 600, 900, 1000, 1200.

    Be original and as much creative as possible.
  `;

  try {
    const opts: Parameters<AIAdapter["generateContent"]>[1] = { jsonSchema: plotDetailsSchema };
    if (adapter.name === "gemini") opts.model = FAST_MODEL;
    const { text } = await adapter.generateContent(prompt, opts);
    const raw = JSON.parse(text || "{}");
    // Normalize keys from OpenRouter/other providers (e.g. Title, Setting, "Rules of the World")
    return {
      title: raw.title ?? raw.Title ?? "",
      genre: raw.genre ?? raw.Genre ?? "",
      writingStyle: raw.writingStyle ?? raw.WritingStyle ?? "",
      setting: raw.setting ?? raw.Setting ?? "",
      plot: raw.plot ?? raw.Plot ?? "",
      rules: raw.rules ?? raw["Rules of the World"] ?? "",
      objective: raw.objective ?? raw["Story Objective"] ?? "",
      episodeLength: raw.episodeLength ?? raw["Episode Length"] ?? 600,
    };
  } catch (error) {
    console.error("Error generating plot details:", error);
    return {};
  }
};

/** Refine a raw plot/concept into a short story summary (2–4 sentences). */
export const refinePlot = async (rawInput: string): Promise<string> => {
  if (!rawInput?.trim()) return "";
  const prompt = `
    Turn this raw story idea or concept into a clear, 2–4 sentence plot summary.
    Keep the same idea and tone; just make it a concise "what this story is about" description.
    Reply with ONLY the plot summary, no labels or extra text.

    Input: "${rawInput.trim()}"
  `;
  try {
    const opts = adapter.name === "gemini" ? { model: FAST_MODEL } : undefined;
    const { text } = await adapter.generateContent(prompt, opts);
    return (text || "").trim();
  } catch (error) {
    console.error("Error refining plot:", error);
    return rawInput;
  }
};

// --- Characters ---
export const generateDefaultCharacters = async (draft: PlotDraft): Promise<Partial<Character>[]> => {
  const prompt = `
    Create 3 compelling characters for:
    Title: ${draft.title}
    Genre: ${draft.genre}
    Writing style: ${draft.writingStyle}
    Setting: ${draft.setting}
    Plot: ${draft.plot}
    Objective: ${draft.objective}

    Roles: Hero, Villain, Mentor, Sidekick, Rival, Antihero, Trickster, Narrator.
  `;

  try {
    const opts: Parameters<AIAdapter["generateContent"]>[1] = { jsonSchema: characterSchema };
    if (adapter.name === "gemini") opts.model = FAST_MODEL;
    const { text } = await adapter.generateContent(prompt, opts);
    const json = JSON.parse(text || "{}");
    return (json.characters ?? []).map((c: any) => ({
      ...c,
      submittedBy: "Director (AI)",
      isDefault: true,
      traits: c.traits ?? [],
    }));
  } catch (error) {
    console.error("Error generating characters:", error);
    return [];
  }
};

// --- Episode ---
export const generateNextEpisode = async (
  plot: Plot
): Promise<{
  title: string;
  text: string;
  summary: string[];
  memory: string;
  charactersUsed: string[];
}> => {
  const episodeNum = plot.episodes.length + 1;
  const recentEpisodes = plot.episodes.slice(-2);
  const recentSummary = recentEpisodes
    .map((e) => `Episode ${e.episodeNumber} (${e.title}):\n${e.summary.join("\n")}`)
    .join("\n\n");
  const charDescriptions = plot.characters
    .map(
      (c) => `
    Name: ${c.name} (${c.role})
    Traits: ${Array.isArray(c.traits) ? c.traits.join(", ") : c.traits}
    Motivation: ${c.motivation}
    Speaking Style: ${c.speakingStyle}
    Context: ${c.characterization}
    ${c.secret ? `Secret: ${c.secret}` : ""}
  `
    )
    .join("\n---\n");
  const newChars = plot.characters
    .filter((c) => c.joinedAtEpisode === episodeNum)
    .map((c) => c.name)
    .join(", ");
  const isFirstEpisode = episodeNum === 1;

  const promptText = `
    You are the Director AI for "StoryVerse". Write Episode ${episodeNum}.

    METADATA:
    Title: ${plot.title}
    Genre: ${plot.genre}
    Writing style (language complexity/tone): ${plot.writingStyle}
    Setting: ${plot.setting}
    Plot: ${plot.plot}
    Rules: ${plot.rules}
    Objective: ${plot.objective}
    Length: ${plot.episodeLength} words.

    CHARACTERS:
    ${charDescriptions}

    ${!isFirstEpisode && newChars ? `NEW CHARACTERS: ${newChars} (Introduce them)` : ""}

    PREVIOUS MEMORY:
    ${plot.storyMemory || "None"}
    
    RECENT EVENTS:
    ${recentSummary || "None"}

    INSTRUCTIONS:
    1. Write a compelling narrative.
    2. Focus on interaction.
    3. Advance the plot.
    4. If Ep 1, establish world.
    5. Update Story Memory.
  `;

  const parseEpisode = (raw: string) => {
    const data = JSON.parse(raw || "{}");
    // Normalize keys from OpenRouter/other providers (title, narrative, story_memory, recent_events)
    const title = data.episodeTitle ?? data.title ?? "";
    const text = data.episodeText ?? data.narrative ?? "";
    const summary = Array.isArray(data.episodeSummary)
      ? data.episodeSummary
      : Array.isArray(data.recent_events)
        ? data.recent_events
        : [];
    const memory = data.storyMemory ?? data.story_memory ?? "";
    const charactersUsed = Array.isArray(data.charactersUsed) ? data.charactersUsed : [];
    return { title, text, summary, memory, charactersUsed };
  };

  try {
    if (adapter.name === "gemini") {
      try {
        const { text } = await adapter.generateContent(promptText, {
          jsonSchema: episodeSchema,
          model: CREATIVE_MODEL,
          extra: { thinkingConfig: { thinkingBudget: 1024 } },
        } as any);
        return parseEpisode(text);
      } catch (creativeErr) {
        console.warn("Creative model failed, falling back to fast model.", creativeErr);
      }
    }
    const episodeOpts: Parameters<AIAdapter["generateContent"]>[1] = { jsonSchema: episodeSchema };
    if (adapter.name === "gemini") episodeOpts.model = FAST_MODEL;
    const { text } = await adapter.generateContent(promptText, episodeOpts);
    return parseEpisode(text);
  } catch (error) {
    console.error("Failed to generate episode:", error);
    throw new Error("Failed to generate episode. Quota exceeded or AI error.");
  }
};
