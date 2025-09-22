import { Router } from "express";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/can.access";
import { UserRole } from "../common/types";
import idValidator from "../common/validators/id-validator";
import productCreateValidator from "./validators/product-create-validator";
import productUpdateValidator from "./validators/product-update-validator";
import productGetAllValidator from "./validators/product-get-all-validator";
import { ProductService } from "./product-service";
import { ProductModel } from "./product-model";
import { ProductController } from "./product-controller";
import logger from "../common/utils/logger";
import { CloudinaryStorage } from "../common/services/CloudinaryStorage";
import createHttpError from "http-errors";
import fileUpload from "express-fileupload";

const router = Router();

const productService = new ProductService(ProductModel);
const cloudinaryStorage = new CloudinaryStorage("products", "image", "webp");
const productController = new ProductController(
  productService,
  cloudinaryStorage,
  logger,
);

router.delete(
  "/:id",
  authenticate,
  canAccess([UserRole.ADMIN, UserRole.MANAGER]),
  idValidator("Product"),
  productController.delete,
);

router.get("/", productGetAllValidator, productController.getAll);

router.get("/:id", idValidator("Product"), productController.getOne);

router.post(
  "/",
  authenticate,
  canAccess([UserRole.ADMIN, UserRole.MANAGER]),
  fileUpload({
    limits: { fileSize: 500 * 1024 },
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, "File size exceeds the limit");
      next(error);
    },
  }),
  productCreateValidator,
  productController.create,
);

router.patch(
  "/:id",
  authenticate,
  canAccess([UserRole.ADMIN, UserRole.MANAGER]),
  idValidator("Product"),
  fileUpload({
    limits: { fileSize: 500 * 1024 },
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, "File size exceeds the limit");
      next(error);
    },
  }),
  productUpdateValidator,
  productController.update,
);

export default router;
