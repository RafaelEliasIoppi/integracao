import express from "express";
import fs from "fs";
import path from "path";
import { runPipeline } from "./core/pipeline";
import { loadConfig } from "./utils/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));


app.post("/run", async (req, res) => {
  try {
    const cfg = await loadConfig(req.body?.configPath ?? "config/default.yaml");
    await runPipeline(cfg);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 👇 nova rota para listar arquivos
app.get("/files", (req, res) => {
  const dir = path.resolve("out");
  const files = fs.readdirSync(dir);
  res.json(files);
});

// 👇 rota para baixar arquivos
app.get("/files/:name", (req, res) => {
  const filePath = path.resolve("out", req.params.name);
  res.download(filePath);
});

app.listen(3000, () => console.log("API rodando em http://localhost:3000"));
