import { Exporter, RecordData } from "../types";
import fs from "fs";

export const jsonExporter: Exporter = {
  name: "json",
  async init(config) {
    // Nenhuma inicialização necessária para JSON
  },
  async export(rows: RecordData[], params) {
    const path = String(params?.path ?? "out/dados.json");
    fs.writeFileSync(path, JSON.stringify(rows, null, 2), "utf-8");
  }
};
