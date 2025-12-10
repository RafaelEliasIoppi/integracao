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
