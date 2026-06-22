import cron from "node-cron";
import { syncEconomicNews } from "../services/newsService";

export function startNewsCron() {
  if (process.env.NEWS_CRON_ENABLED === "false") {
    return;
  }

  cron.schedule("0 */6 * * *", () => {
    syncEconomicNews().catch((error) => {
      console.error("Scheduled news sync failed", error);
    });
  });
}
