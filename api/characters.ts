import type { PlotDraft } from "../types";
import { generateDefaultCharacters } from "../services/apiService";

export const config = { maxDuration: 60 };

export async function POST(request: Request): Promise<Response> {
  try {
    const draft = (await request.json().catch(() => null)) as PlotDraft | null;
    if (!draft || typeof draft.title !== "string") {
      return Response.json({ error: "Invalid draft" }, { status: 400 });
    }
    const result = await generateDefaultCharacters(draft);
    return Response.json(result);
  } catch (err) {
    console.error("POST /api/characters:", err);
    const message = err instanceof Error ? err.message : "Failed to generate characters";
    return Response.json({ error: message }, { status: 500 });
  }
}
