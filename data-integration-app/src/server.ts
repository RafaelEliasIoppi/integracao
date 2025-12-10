import express from "express";
import { runPipeline } from "./core/pipeline";
import { loadConfig } from "./utils/config";

const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  try {
    const cfg = await loadConfig(req.body?.configPath ?? "config/default.yaml");
    await runPipeline(cfg.pipeline);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("API on :3000"));
