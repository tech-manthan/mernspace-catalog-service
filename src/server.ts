import config from "config";
import app from "./app";
import logger from "./utils/logger";
import { initDb } from "./utils/db";

const startServer = async () => {
  try {
    const PORT = config.get("server.port") || 5502;

    await initDb();

    app.listen(PORT, () => {
      logger.info("Server Listening on port", { port: PORT });
    });
  } catch (err) {
    // console.error(err);
    logger.error(err);
    process.exit(1);
  }
};

void startServer();
