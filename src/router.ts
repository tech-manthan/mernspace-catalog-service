import categoryRouter from "./category/category-router";

import { Router } from "express";

const router = Router();

router.use("/categories", categoryRouter);

export default router;
