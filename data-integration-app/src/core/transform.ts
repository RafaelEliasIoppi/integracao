import { RecordData } from "../types";

export function applyTransform(
  rows: RecordData[],
  transform?: { mapping?: Record<string, string>; scripts?: string[] }
): RecordData[] {
  let out = rows;
  if (transform?.mapping) {
    out = out.map(r => {
      const mapped: RecordData = {};
      for (const [to, from] of Object.entries(transform.mapping)) {
        mapped[to] = (r as any)[from];
      }
      return mapped;
    });
  }
  return out;
}
