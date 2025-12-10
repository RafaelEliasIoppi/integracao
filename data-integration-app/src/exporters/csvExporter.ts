import { Exporter, RecordData } from "../types";
import fs from "fs";

/**
 * Exportador CSV
 * Converte registros em formato tabular e salva em arquivo .csv
 */
export const csvExporter: Exporter = {
  name: "csv",
  async init(config) {
    // Nenhuma inicialização necessária para CSV
  },
  async export(rows: RecordData[], params) {
    const path = String(params?.path ?? "out/dados.csv");

    if (!rows || rows.length === 0) {
      fs.writeFileSync(path, "", "utf-8");
      return;
    }

    // Cabeçalhos: todas as chaves do primeiro registro
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(","), // primeira linha: cabeçalho
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))
    ];

    fs.writeFileSync(path, lines.join("\n"), "utf-8");
  }
};
