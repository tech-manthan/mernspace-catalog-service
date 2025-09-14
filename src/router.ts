import { Router } from "express";
import { categoryRouter } from "./category";

const router = Router();

router.use("/categories", categoryRouter);

export default router;
