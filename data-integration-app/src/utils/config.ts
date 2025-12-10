import fs from "fs";
import yaml from "js-yaml";
import { PipelineConfig, Connector, Exporter } from "../types";
import { httpJsonConnector } from "../connectors/httpJson";
import { csvLocalConnector } from "../connectors/csvLocal";
import { jsonExporter } from "../exporters/jsonExporter";
import { csvExporter } from "../exporters/csvExporter";

/**
 * Carrega configuração YAML e retorna objeto tipado.
 */
export async function loadConfig(
  path = "config/default.yaml"
): Promise<PipelineConfig> {
  const text = fs.readFileSync(path, "utf8");
  const cfg = yaml.load(text) as PipelineConfig;
  return cfg;
}

/**
 * Resolve conector pelo tipo.
 */
export function getConnectorByType(type: string): Connector {
  switch (type) {
    case "http-json":
      return httpJsonConnector;
    case "csv-local":
      return csvLocalConnector;
    default:
      throw new Error(`Connector não suportado: ${type}`);
  }
}

/**
 * Resolve exportador pelo tipo.
 */
export function getExporterByType(type: string): Exporter {
  switch (type) {
    case "json":
      return jsonExporter;
    case "csv":
      return csvExporter;
    default:
      throw new Error(`Exporter não suportado: ${type}`);
  }
}
