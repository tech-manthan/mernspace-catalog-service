import { Router } from "express";
import { categoryRouter } from "./category";
import { productRouter } from "./product";
import { toppingRouter } from "./topping";

const router = Router();

router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/toppings", toppingRouter);

export default router;
