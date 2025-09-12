import express from "express";
import cookieParser from "cookie-parser";

import { globalErrorHandler } from "./common/middleware/global.error.handler";
import router from "./router";

const app = express();

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

app.use("/api", router);

app.use(globalErrorHandler());

export default app;
