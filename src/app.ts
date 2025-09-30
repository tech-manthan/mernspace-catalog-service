import config from "config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { globalErrorHandler } from "./common/middleware/global.error.handler";
import router from "./router";

const app = express();

app.use(
  cors({
    origin: [
      config.get("frontend.dashboard_url"),
      config.get("frontend.client_url"),
    ],
    credentials: true,
  }),
);
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to Catalog Service");
});

app.use(router);

app.use(globalErrorHandler());

export default app;
