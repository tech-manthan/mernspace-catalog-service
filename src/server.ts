import config from "config";
import app from "./app";
import logger from "./utils/logger";

const startServer = () => {
  try {
    const PORT = config.get("server.port") || 5502;

    app.listen(PORT, () => {
      // console.log(`Listening on port ${PORT}`);
      logger.info("Server Listening on port", { port: PORT });
    });
  } catch (err) {
    // console.error(err);
    logger.error(err);
    process.exit(1);
  }
};

startServer();
