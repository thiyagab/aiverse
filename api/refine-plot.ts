import { refinePlot } from "../services/apiService";

export const config = { maxDuration: 60 };

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    const rawInput = body?.rawInput;
    if (typeof rawInput !== "string") {
      return Response.json({ error: "Missing or invalid rawInput" }, { status: 400 });
    }
    const result = await refinePlot(rawInput);
    return Response.json({ text: result });
  } catch (err) {
    console.error("POST /api/refine-plot:", err);
    const message = err instanceof Error ? err.message : "Failed to refine plot";
    return Response.json({ error: message }, { status: 500 });
  }
}
