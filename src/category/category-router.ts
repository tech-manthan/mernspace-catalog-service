import { Router } from "express";
import { CategoryController } from "./category-controller";
import { CategoryModel } from "./category-model";
import logger from "../common/utils/logger";
import categoryCreateValidator from "./validators/category-create-validator";
import { CategoryService } from "./category-service";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/can.access";
import { UserRole } from "../common/types";
// import { asyncWrapper } from "../common/utils/async-wrapper";

const router = Router();

const categoryService = new CategoryService(CategoryModel);
const categoryController = new CategoryController(categoryService, logger);

// router.post(
//   "/",
//   authenticate,
//   canAccess([UserRole.ADMIN]),
//   categoryCreateValidator,
//   asyncWrapper(categoryController.create),
// );

router.post(
  "/",
  authenticate,
  canAccess([UserRole.ADMIN]),
  categoryCreateValidator,
  categoryController.create,
);

export default router;
