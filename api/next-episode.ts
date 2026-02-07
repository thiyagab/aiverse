import type { Plot } from "../types";
import { generateNextEpisode } from "../services/apiService";

export const config = { maxDuration: 120 };

export async function POST(request: Request): Promise<Response> {
  try {
    const plot = (await request.json().catch(() => null)) as Plot | null;
    if (!plot?.id || !Array.isArray(plot.episodes)) {
      return Response.json({ error: "Invalid plot" }, { status: 400 });
    }
    const result = await generateNextEpisode(plot);
    return Response.json(result);
  } catch (err) {
    console.error("POST /api/next-episode:", err);
    const message = err instanceof Error ? err.message : "Failed to generate episode";
    return Response.json({ error: message }, { status: 500 });
  }
}
