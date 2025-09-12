import { CreateCategoryRequest } from "./category-types";
import { Logger } from "winston";
import { NextFunction, Response } from "express";
import { CategoryService } from "./category-service";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private logger: Logger,
  ) {
    this.create = this.create.bind(this);
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
}
