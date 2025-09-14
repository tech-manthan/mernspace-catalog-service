import {
  CategoryController,
  CategoryModel,
  CategoryService,
} from "../../category";
import { ProductModel } from "../../product";
import logger from "../utils/logger";

export const categoryService = new CategoryService(CategoryModel, ProductModel);
export const categoryController = new CategoryController(
  categoryService,
  logger,
);
