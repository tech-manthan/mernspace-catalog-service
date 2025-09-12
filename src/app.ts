import express from "express";
import { globalErrorHandler } from "./middleware/global.error.handler";

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Catalog Service");
});

app.use(globalErrorHandler());

export default app;
