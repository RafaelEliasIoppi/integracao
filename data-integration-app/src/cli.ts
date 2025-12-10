import { runPipeline } from "./core/pipeline";
import { loadConfig } from "./utils/config";



(async () => {
  const cfg = await loadConfig();
  await runPipeline(cfg);
})();
