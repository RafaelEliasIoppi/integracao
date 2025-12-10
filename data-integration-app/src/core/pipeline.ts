import { Connector, Exporter, PipelineConfig, RecordData } from "../types";
import { applyTransform } from "./transform";
import { getConnectorByType, getExporterByType } from "../utils/config";
import { logger } from "../utils/logger";

export async function runPipeline(cfg: PipelineConfig): Promise<void> {
  const connector: Connector = getConnectorByType(cfg.source.type);
  await connector.init(cfg.source.config);

  logger.info(`Extraindo dados com o conector: ${connector.name}`);
  const raw: RecordData[] = await connector.extract(cfg.source.params);

  logger.info(`Transformando ${raw.length} registros`);
  const transformed = applyTransform(raw, cfg.transform);

  // 👇 Suporte a múltiplos destinos
  const destinations = (cfg as any).destinations ?? [cfg.destination];
  for (const dest of destinations) {
    const exporter: Exporter = getExporterByType(dest.type);
    await exporter.init(dest.config);
    logger.info(`Exportando dados com o exportador: ${exporter.name}`);
    await exporter.export(transformed, dest.params);
  }

  logger.info("Pipeline concluído com sucesso");
}
