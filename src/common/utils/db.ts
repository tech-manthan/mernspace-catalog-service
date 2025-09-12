import config from "config";
import mongoose from "mongoose";
import logger from "./logger";

export const initDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      logger.info("Database connected successfully");
    });

    mongoose.connection.on("error", () => {
      logger.error("Failed to connect database");
      process.exit(1);
    });

    await mongoose.connect(config.get("database.url"));
  } catch (err) {
    if (err instanceof Error) {
      logger.error("Failed to start database", {
        message: err.message,
      });
    }
    process.exit(1);
  }
};
