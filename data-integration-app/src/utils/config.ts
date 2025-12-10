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
    default: throw new Error();
  }
}

export function getExporterByType(type: string) {
  switch (type) {
    case "json": return jsonExporter;
    case "csv": return csvExporter;
    default: throw new Error();
  }
}
