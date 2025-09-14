import { Router } from "express";
import categoryCreateValidator from "./validators/category-create-validator";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/can.access";
import { UserRole } from "../common/types";
import idValidator from "../common/validators/id-validator";
import categoryUpdateValidator from "./validators/category-update-validator";
import { categoryController } from "../common/ioc";
import categoryGetAllValidator from "./validators/category-get-all-validator";
// import { asyncWrapper } from "../common/utils/async-wrapper";

const router = Router();

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

router.patch(
  "/:id",
  authenticate,
  canAccess([UserRole.ADMIN]),
  idValidator("Category"),
  categoryUpdateValidator,
  categoryController.update,
);

router.delete(
  "/:id",
  authenticate,
  canAccess([UserRole.ADMIN]),
  idValidator("Category"),
  categoryController.delete,
);

router.get("/", categoryGetAllValidator, categoryController.getAll);

router.get("/:id", idValidator("Category"), categoryController.getOne);

export default router;
