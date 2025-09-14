import {
  //   Category,
  CategoryFilter,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./category-types";
import { Logger } from "winston";
import { NextFunction, Request, Response } from "express";
import { CategoryService } from "./category-service";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { IdParams } from "../common/types";

export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private logger: Logger,
  ) {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
  }

  async create(req: CreateCategoryRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return next(createHttpError(400, result.array().at(0)?.msg as string));
      }

      const { name, attributes, priceConfiguration } = req.body;

      const category = await this.categoryService.create({
        name,
        attributes,
        priceConfiguration,
      });

      this.logger.info("category created successfully", {
        id: category._id,
      });

      res.status(201).json({
        id: category._id,
      });
    } catch {
      next(createHttpError(500, "failed to create category"));
    }
  }

  async update(req: UpdateCategoryRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return next(createHttpError(400, result.array().at(0)?.msg as string));
      }

      const { id } = matchedData<IdParams>(req, {
        onlyValidData: true,
      });

      const existingCategory = await this.categoryService.getCategory(id);

      if (!existingCategory) {
        return next(createHttpError(404, "category not found"));
      }

      const { name, attributes, priceConfiguration } = req.body;

      //   const updateData: Partial<Category> = {};
      //   if (attributes) {
      //     updateData.attributes = [...existingCategory.attributes, ...attributes];
      //   }

      //   if (priceConfiguration) {
      //     updateData.priceConfiguration = {
      //       ...existingCategory.priceConfiguration,
      //       ...priceConfiguration,
      //     };
      //   }

      //   const category = await this.categoryService.update(id, {
      //     name: name,
      //     attributes: updateData.attributes,
      //     priceConfiguration: updateData.priceConfiguration,
      //   });

      const category = await this.categoryService.update(id, {
        name: name,
        attributes: attributes,
        priceConfiguration: priceConfiguration,
      });

      if (!category) {
        return next(createHttpError(500, "failed"));
      }

      this.logger.info("category updated successfully", {
        id: category._id,
      });

      res.status(200).json({
        id: category._id,
      });
    } catch {
      next(createHttpError(500, "failed to update category"));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPage, perPage, q } = matchedData<CategoryFilter>(req, {
        onlyValidData: true,
      });

      const { docs, totalDocs, page, limit } =
        await this.categoryService.getCategories(q, {
          page: currentPage,
          limit: perPage,
        });

      res.json({
        data: docs,
        total: totalDocs,
        currentPage: page,
        perPage: limit,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to get all categories"));
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        next(createHttpError(400, result.array().at(0)?.msg as string));

        return;
      }

      const { id } = matchedData<IdParams>(req, {
        onlyValidData: true,
      });

      const category = await this.categoryService.getCategory(id);

      if (!category) {
        return next(createHttpError(404, "category not found"));
      }

      return res.json(category);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to get category"));
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        next(createHttpError(400, result.array().at(0)?.msg as string));

        return;
      }

      const { id } = matchedData<IdParams>(req, {
        onlyValidData: true,
      });

      const { deletedCount, acknowledged } =
        await this.categoryService.deleteCategory(id);

      if (!acknowledged || deletedCount !== 1) {
        return next(
          createHttpError(404, "category not deleted, some error try again"),
        );
      }

      return res.json({
        id: id,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to get category"));
    }
  }
}
