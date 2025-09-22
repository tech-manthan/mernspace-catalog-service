import { Logger } from "winston";
import { ProductService } from "./product-service";
import { v4 as uuid } from "uuid";
import {
  CreateProductRequest,
  ProductValidFilters,
  UpdateProductRequest,
} from "./product-types";
import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AuthRequest, IdParams, UserRole } from "../common/types";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";

export class ProductController {
  constructor(
    private productService: ProductService,
    private storageService: FileStorage,
    private logger: Logger,
  ) {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
  }

  async create(req: CreateProductRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return next(createHttpError(400, result.array().at(0)?.msg as string));
      }

      const image = req.files!.image as UploadedFile;
      const imageName = uuid();

      await this.storageService.upload({
        filename: imageName,
        fileData: image.data,
      });

      const {
        name,
        attributes,
        priceConfiguration,
        categoryId,
        description,
        tenantId,
        isPublish,
      } = req.body;

      // const imageUrl = this.storageService.getObjectUri(imageName);

      const product = await this.productService.create({
        name,
        attributes,
        priceConfiguration,
        categoryId,
        description,
        image: imageName,
        tenantId,
        isPublish,
      });

      this.logger.info("product created successfully", {
        id: product._id,
      });

      res.status(201).json({
        id: product._id,
      });
    } catch {
      next(createHttpError(500, "failed to create product"));
    }
  }

  async update(req: UpdateProductRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return next(createHttpError(400, result.array().at(0)?.msg as string));
      }

      const { id } = matchedData<IdParams>(req, {
        onlyValidData: true,
      });

      const existingProduct = await this.productService.getProduct(id);

      if (!existingProduct) {
        return next(createHttpError(404, "product not found"));
      }

      if ((req as AuthRequest).auth.role === UserRole.MANAGER) {
        if (existingProduct.tenantId !== (req as AuthRequest).auth.tenant) {
          return next(
            createHttpError(403, "You are not allowed to access this product"),
          );
        }
      }

      let newImageName: string | undefined;

      if (req.files?.image) {
        const image = req.files.image as UploadedFile;
        newImageName = uuid();

        await this.storageService.upload({
          filename: newImageName,
          fileData: image.data,
        });

        await this.storageService.delete(existingProduct.image);
      }

      const {
        name,
        attributes,
        priceConfiguration,
        categoryId,
        description,
        isPublish,
        tenantId,
      } = req.body || {};

      const product = await this.productService.update(id, {
        name: name,
        attributes: attributes,
        priceConfiguration: priceConfiguration,
        categoryId,
        description,
        image: newImageName ? newImageName : existingProduct.image,
        isPublish,
        tenantId,
      });

      if (!product) {
        return next(createHttpError(500, "failed to update product"));
      }

      this.logger.info("product updated successfully", {
        id: product._id,
      });

      res.status(200).json({
        id: product._id,
      });
    } catch {
      next(createHttpError(500, "failed to update product"));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPage, perPage, q, categoryId, isPublish, tenantId } =
        matchedData<ProductValidFilters>(req, {
          onlyValidData: true,
        });

      const { docs, totalDocs, page, limit } =
        await this.productService.getProducts(
          q,
          {
            categoryId,
            isPublish,
            tenantId: tenantId,
          },
          {
            page: currentPage,
            limit: perPage,
          },
        );

      const data = docs.map((doc) => {
        const image = this.storageService.getObjectUri(doc.image);

        return {
          ...doc,
          image: image,
        };
      });

      res.json({
        data: data,
        total: totalDocs,
        currentPage: page,
        perPage: limit,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to get all products"));
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

      const product = await this.productService.getProduct(id);

      if (!product) {
        return next(createHttpError(404, "product not found"));
      }

      const image = this.storageService.getObjectUri(product.image);

      return res.json({ ...product, image });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to get product"));
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

      const existingProduct = await this.productService.getProduct(id);

      if (!existingProduct) {
        return next(createHttpError(404, "product not found"));
      }

      if ((req as AuthRequest).auth.role === UserRole.MANAGER) {
        if (existingProduct.tenantId !== (req as AuthRequest).auth.tenant) {
          return next(
            createHttpError(403, "You are not allowed to delete this product"),
          );
        }
      }

      await this.storageService.delete(existingProduct.image);

      const { deletedCount, acknowledged } =
        await this.productService.deleteProduct(id);

      if (!acknowledged || deletedCount !== 1) {
        return next(
          createHttpError(404, "product not deleted, some error try again"),
        );
      }

      return res.json({
        id: id,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to delete product"));
    }
  }
}
