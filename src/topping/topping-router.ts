import { Router } from "express";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/can.access";
import { UserRole } from "../common/types";
import idValidator from "../common/validators/id-validator";
import toppingCreateValidator from "./validators/topping-create-validator";
import toppingUpdateValidator from "./validators/topping-update-validator";
import toppingGetAllValidator from "./validators/topping-get-all-validator";
import { ToppingService } from "./topping-service";
import { ToppingModel } from "./topping-model";
import { ToppingController } from "./topping-controller";
import logger from "../common/utils/logger";
import { CloudinaryStorage } from "../common/services/CloudinaryStorage";
import createHttpError from "http-errors";
import fileUpload from "express-fileupload";

const router = Router();

const toppingService = new ToppingService(ToppingModel);
const cloudinaryStorage = new CloudinaryStorage("toppings", "image", "webp");
const toppingController = new ToppingController(
  toppingService,
  cloudinaryStorage,
  logger,
);

router.delete(
  "/:id",
  authenticate,
  canAccess([UserRole.ADMIN, UserRole.MANAGER]),
  idValidator("Topping"),
  toppingController.delete,
);

router.get("/", toppingGetAllValidator, toppingController.getAll);

router.get("/:id", idValidator("Topping"), toppingController.getOne);

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
  toppingCreateValidator,
  toppingController.create,
);

router.patch(
  "/:id",
  authenticate,
  canAccess([UserRole.ADMIN, UserRole.MANAGER]),
  idValidator("Topping"),
  fileUpload({
    limits: { fileSize: 500 * 1024 },
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, "File size exceeds the limit");
      next(error);
    },
  }),
  toppingUpdateValidator,
  toppingController.update,
);

export default router;
