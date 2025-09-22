import { Logger } from "winston";
import { ToppingService } from "./topping-service";
import { v4 as uuid } from "uuid";
import {
  CreateToppingRequest,
  ToppingValidFilters,
  UpdateToppingRequest,
} from "./topping-types";
import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AuthRequest, IdParams, UserRole } from "../common/types";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";

export class ToppingController {
  constructor(
    private toppingService: ToppingService,
    private storageService: FileStorage,
    private logger: Logger,
  ) {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
  }

  async create(req: CreateToppingRequest, res: Response, next: NextFunction) {
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

      const { name, price, categoryId, tenantId, isPublish } = req.body;

      // const imageUrl = this.storageService.getObjectUri(imageName);

      const topping = await this.toppingService.create({
        name,
        price,
        categoryId,
        image: imageName,
        tenantId,
        isPublish,
      });

      this.logger.info("topping created successfully", {
        id: topping._id,
      });

      res.status(201).json({
        id: topping._id,
      });
    } catch {
      next(createHttpError(500, "failed to create topping"));
    }
  }

  async update(req: UpdateToppingRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return next(createHttpError(400, result.array().at(0)?.msg as string));
      }

      const { id } = matchedData<IdParams>(req, {
        onlyValidData: true,
      });

      const existingTopping = await this.toppingService.getTopping(id);

      if (!existingTopping) {
        return next(createHttpError(404, "topping not found"));
      }

      if ((req as AuthRequest).auth.role === UserRole.MANAGER) {
        if (existingTopping.tenantId !== (req as AuthRequest).auth.tenant) {
          return next(
            createHttpError(403, "You are not allowed to access this topping"),
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

        await this.storageService.delete(existingTopping.image);
      }

      const { name, price, categoryId, isPublish, tenantId } = req.body || {};

      const topping = await this.toppingService.update(id, {
        name: name,
        price,
        categoryId,
        image: newImageName ? newImageName : existingTopping.image,
        isPublish,
        tenantId,
      });

      if (!topping) {
        return next(createHttpError(500, "failed to update topping"));
      }

      this.logger.info("topping updated successfully", {
        id: topping._id,
      });

      res.status(200).json({
        id: topping._id,
      });
    } catch {
      next(createHttpError(500, "failed to update topping"));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPage, perPage, q, categoryId, isPublish, tenantId } =
        matchedData<ToppingValidFilters>(req, {
          onlyValidData: true,
        });

      const { docs, totalDocs, page, limit } =
        await this.toppingService.getToppings(
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
      next(createHttpError(500, "failed to get all toppings"));
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

      const topping = await this.toppingService.getTopping(id);

      if (!topping) {
        return next(createHttpError(404, "topping not found"));
      }

      const image = this.storageService.getObjectUri(topping.image);

      return res.json({ ...topping, image });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to get topping"));
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

      const existingTopping = await this.toppingService.getTopping(id);

      if (!existingTopping) {
        return next(createHttpError(404, "topping not found"));
      }

      if ((req as AuthRequest).auth.role === UserRole.MANAGER) {
        if (existingTopping.tenantId !== (req as AuthRequest).auth.tenant) {
          return next(
            createHttpError(403, "You are not allowed to delete this topping"),
          );
        }
      }

      await this.storageService.delete(existingTopping.image);

      const { deletedCount, acknowledged } =
        await this.toppingService.deleteTopping(id);

      if (!acknowledged || deletedCount !== 1) {
        return next(
          createHttpError(404, "topping not deleted, some error try again"),
        );
      }

      return res.json({
        id: id,
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      next(createHttpError(500, "failed to delete topping"));
    }
  }
}
