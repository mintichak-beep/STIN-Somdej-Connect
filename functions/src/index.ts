import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

export const dailyCleanup = onSchedule("0 0 * * *", async (event) => {
  logger.info("Running daily cleanup...");
});
