import { Connector, Exporter, PipelineConfig, RecordData } from "../types";
import { applyTransform } from "./transform";
import { getConnectorByType, getExporterByType } from "../utils/config";
import { logger } from "../utils/logger";

export async function runPipeline(cfg: PipelineConfig): Promise<void> {
  const connector: Connector = getConnectorByType(cfg.source.type);
  const exporter: Exporter = getExporterByType(cfg.destination.type);

  await connector.init(cfg.source.config);
  await exporter.init(cfg.destination.config);

  logger.info();
  const raw: RecordData[] = await connector.extract(cfg.source.params);

  logger.info();
  const transformed = applyTransform(raw, cfg.transform);

  logger.info();
  await exporter.export(transformed, cfg.destination.params);

  logger.info("Pipeline concluído");
}
