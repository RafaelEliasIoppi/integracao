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
