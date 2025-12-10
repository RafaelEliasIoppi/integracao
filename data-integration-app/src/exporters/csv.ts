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
