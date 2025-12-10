import fetch from "node-fetch";
import { Connector, RecordData } from "../types";

export const httpJsonConnector: Connector = {
  name: "http-json",
  async init(config) { /* opcional: auth, headers */ },
  async extract(params) {
    const url = String(params?.url);
    const headers = (params?.headers ?? {}) as Record<string, string>;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error();
    const body = await res.json();
    const arr = Array.isArray(body) ? body : body.items || [body];
    return arr as RecordData[];
  }
};
