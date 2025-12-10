#!/usr/bin/env bash
set -e

APP_NAME="data-integration-app"
echo "==> Criando projeto: $APP_NAME"

mkdir -p "$APP_NAME"
cd "$APP_NAME"

# Node + projeto
echo "==> Inicializando Node"
npm init -y >/dev/null

# Dependências
echo "==> Instalando dependências"
npm install typescript ts-node @types/node node-fetch csv-parse js-yaml express @types/express >/dev/null

# TypeScript config
cat > tsconfig.json <<TS
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
TS

# Estrutura de pastas
mkdir -p src/{core,connectors,exporters,utils,types} config/mappings tests

# Scripts no package.json
node - <<'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
pkg.type = "module";
pkg.scripts = {
  "dev:cli": "ts-node src/cli.ts",
  "dev:api": "ts-node src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
NODE

# Config default
cat > config/default.yaml <<CFG
pipeline:
  source:
    type: http-json
    config: { }
    params:
      url: "https://jsonplaceholder.typicode.com/users"
  transform:
    mapping:
      id: "id"
      nome: "name"
      email: "email"
  destination:
    type: csv
    config: { }
    params:
      path: "out/dados.csv"
CFG

# Utils: logger e config
cat > src/utils/logger.ts <<TS
export const logger = {
  info: (m: string) => console.log(`INFO  ${m}`),
  warn: (m: string) => console.warn(`WARN  ${m}`),
  error: (m: string) => console.error(`ERROR ${m}`)
};
TS

cat > src/utils/config.ts <<TS
import fs from "fs";
import yaml from "js-yaml";
import { PipelineConfig } from "../types";
import { httpJsonConnector } from "../connectors/httpJson";
import { csvLocalConnector } from "../connectors/csvLocal";
import { jsonExporter } from "../exporters/json";
import { csvExporter } from "../exporters/csv";

export async function loadConfig(path = "config/default.yaml"): Promise<{ pipeline: PipelineConfig }> {
  const text = fs.readFileSync(path, "utf8");
  const cfg = yaml.load(text) as any;
  return cfg;
}

export function getConnectorByType(type: string) {
  switch (type) {
    case "http-json": return httpJsonConnector;
    case "csv-local": return csvLocalConnector;
    default: throw new Error(`Connector not found: ${type}`);
  }
}

export function getExporterByType(type: string) {
  switch (type) {
    case "json": return jsonExporter;
    case "csv": return csvExporter;
    default: throw new Error(`Exporter not found: ${type}`);
  }
}
TS

# Tipos
cat > src/types/index.ts <<TS
export type RecordData = Record<string, unknown>;

export interface Connector {
  name: string;
  init(config: Record<string, unknown>): Promise<void>;
  extract(params?: Record<string, unknown>): Promise<RecordData[]>;
}

export interface Exporter {
  name: string;
  init(config: Record<string, unknown>): Promise<void>;
  export(data: RecordData[], params?: Record<string, unknown>): Promise<void>;
}

export interface PipelineConfig {
  source: { type: string; config: Record<string, unknown>; params?: Record<string, unknown> };
  transform?: { mapping?: Record<string, string>; scripts?: string[] };
  destination: { type: string; config: Record<string, unknown>; params?: Record<string, unknown> };
}
TS

# Core: transform e pipeline
cat > src/core/transform.ts <<TS
import { RecordData } from "../types";

export function applyTransform(
  rows: RecordData[],
  transform?: { mapping?: Record<string, string>; scripts?: string[] }
): RecordData[] {
  let out = rows;
  if (transform?.mapping) {
    out = out.map(r => {
      const mapped: RecordData = {};
      for (const [to, from] of Object.entries(transform.mapping)) {
        mapped[to] = (r as any)[from];
      }
      return mapped;
    });
  }
  return out;
}
TS

cat > src/core/pipeline.ts <<TS
import { Connector, Exporter, PipelineConfig, RecordData } from "../types";
import { applyTransform } from "./transform";
import { getConnectorByType, getExporterByType } from "../utils/config";
import { logger } from "../utils/logger";

export async function runPipeline(cfg: PipelineConfig): Promise<void> {
  const connector: Connector = getConnectorByType(cfg.source.type);
  const exporter: Exporter = getExporterByType(cfg.destination.type);

  await connector.init(cfg.source.config);
  await exporter.init(cfg.destination.config);

  logger.info(`Extraindo com ${connector.name}`);
  const raw: RecordData[] = await connector.extract(cfg.source.params);

  logger.info(`Transformando ${raw.length} registros`);
  const transformed = applyTransform(raw, cfg.transform);

  logger.info(`Exportando para ${exporter.name}`);
  await exporter.export(transformed, cfg.destination.params);

  logger.info("Pipeline concluído");
}
TS

# Conectores
cat > src/connectors/httpJson.ts <<TS
import fetch from "node-fetch";
import { Connector, RecordData } from "../types";

export const httpJsonConnector: Connector = {
  name: "http-json",
  async init(config) { /* opcional: auth, headers */ },
  async extract(params) {
    const url = String(params?.url);
    const headers = (params?.headers ?? {}) as Record<string, string>;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const arr = Array.isArray(body) ? body : body.items || [body];
    return arr as RecordData[];
  }
};
TS

cat > src/connectors/csvLocal.ts <<TS
import fs from "fs";
import { parse } from "csv-parse/sync";
import { Connector, RecordData } from "../types";

export const csvLocalConnector: Connector = {
  name: "csv-local",
  async init() {},
  async extract(params) {
    const path = String(params?.path);
    const text = fs.readFileSync(path, "utf8");
    const records = parse(text, { columns: true, skip_empty_lines: true });
    return records as RecordData[];
  }
};
TS

# Exportadores
cat > src/exporters/json.ts <<TS
import fs from "fs";
import { Exporter, RecordData } from "../types";

export const jsonExporter: Exporter = {
  name: "json",
  async init() {},
  async export(data: RecordData[], params) {
    const out = String(params?.path ?? "out/output.json");
    require("fs").mkdirSync(require("path").dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(data, null, 2));
  }
};
TS

cat > src/exporters/csv.ts <<TS
import fs from "fs";
import path from "path";
import { Exporter, RecordData } from "../types";

export const csvExporter: Exporter = {
  name: "csv",
  async init() {},
  async export(data: RecordData[], params) {
    const out = String(params?.path ?? "out/output.csv");
    const dir = path.dirname(out);
    fs.mkdirSync(dir, { recursive: true });
    if (!data.length) {
      fs.writeFileSync(out, "");
      return;
    }
    const headers = Object.keys(data[0] || {});
    const lines = [
      headers.join(","),
      ...data.map(row => headers.map(h => JSON.stringify((row as any)[h] ?? "")).join(","))
    ];
    fs.writeFileSync(out, lines.join("\n"));
  }
};
TS

# CLI e API
cat > src/cli.ts <<TS
import { runPipeline } from "./core/pipeline";
import { loadConfig } from "./utils/config";

(async () => {
  const cfg = await loadConfig();
  await runPipeline(cfg.pipeline);
})();
TS

cat > src/server.ts <<TS
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
TS

# README
cat > README.md <<MD
# Data Integration App

Pipeline de integração de dados com conectores plugáveis, transformações e exportadores.

## Como usar
- Rodar via CLI:
  npm run dev:cli
- Rodar API:
  npm run dev:api
  curl -X POST http://localhost:3000/run

## Config
Edite config/default.yaml para definir:
- source.type (http-json, csv-local)
- transform.mapping
- destination.type (csv, json) e params.path
MD

# Build inicial
mkdir -p out
echo "==> Pronto. Comandos:"
echo "   cd $APP_NAME"
echo "   npm run dev:cli      # executa pipeline padrão"
echo "   npm run dev:api      # sobe API na porta 3000"
