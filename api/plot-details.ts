import { generatePlotDetails } from "../services/apiService";

export const config = { maxDuration: 60 };

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    const input = body?.input;
    if (typeof input !== "string") {
      return Response.json({ error: "Missing or invalid input" }, { status: 400 });
    }
    const result = await generatePlotDetails(input);
    return Response.json(result);
  } catch (err) {
    console.error("POST /api/plot-details:", err);
    const message = err instanceof Error ? err.message : "Failed to generate plot details";
    return Response.json({ error: message }, { status: 500 });
  }
}
