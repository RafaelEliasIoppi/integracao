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
