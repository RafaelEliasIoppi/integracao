export const logger = {
  info: (m?: string) => console.log(`INFO  ${m ?? ""}`),
  warn: (m?: string) => console.warn(`WARN  ${m ?? ""}`),
  error: (m?: string) => console.error(`ERROR ${m ?? ""}`)
};
