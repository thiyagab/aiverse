import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  generatePlotDetails,
  refinePlot,
  generateDefaultCharacters,
  generateNextEpisode,
} from "../services/apiService";
import type { PlotDraft } from "../types";
import type { Plot } from "../types";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT ?? 3001;

app.post("/api/plot-details", async (req, res) => {
  try {
    const { input } = req.body as { input?: string };
    if (typeof input !== "string") {
      return res.status(400).json({ error: "Missing or invalid input" });
    }
    const result = await generatePlotDetails(input);
    res.json(result);
  } catch (err) {
    console.error("POST /api/plot-details:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to generate plot details" });
  }
});

app.post("/api/refine-plot", async (req, res) => {
  try {
    const { rawInput } = req.body as { rawInput?: string };
    if (typeof rawInput !== "string") {
      return res.status(400).json({ error: "Missing or invalid rawInput" });
    }
    const result = await refinePlot(rawInput);
    res.json({ text: result });
  } catch (err) {
    console.error("POST /api/refine-plot:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to refine plot" });
  }
});

app.post("/api/characters", async (req, res) => {
  try {
    const draft = req.body as PlotDraft;
    if (!draft || typeof draft.title !== "string") {
      return res.status(400).json({ error: "Invalid draft" });
    }
    const result = await generateDefaultCharacters(draft);
    res.json(result);
  } catch (err) {
    console.error("POST /api/characters:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to generate characters" });
  }
});

app.post("/api/next-episode", async (req, res) => {
  try {
    const plot = req.body as Plot;
    if (!plot || !plot.id || !Array.isArray(plot.episodes)) {
      return res.status(400).json({ error: "Invalid plot" });
    }
    const result = await generateNextEpisode(plot);
    res.json(result);
  } catch (err) {
    console.error("POST /api/next-episode:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to generate episode" });
  }
});

app.listen(PORT, () => {
  console.log(`AI API server running at http://localhost:${PORT}`);
});
