import mongoose, {
  AggregatePaginateModel,
  AggregatePaginateResult,
} from "mongoose";
import {
  CreateProductData,
  Product,
  ProductFilters,
  ProductWithCategory,
  UpdateProductData,
} from "./product-types";
import { PaginateQuery } from "../common/types";

export class ProductService {
  constructor(private productRepository: AggregatePaginateModel<Product>) {}

  async create({
    attributes,
    name,
    priceConfiguration,
    categoryId,
    description,
    image,
    tenantId,
    isPublish,
  }: CreateProductData) {
    return this.productRepository.create({
      name,
      description,
      image,
      attributes,
      priceConfiguration,
      tenantId,
      categoryId,
      isPublish: isPublish ? isPublish : false,
    });
  }

  async update(
    id: mongoose.Types.ObjectId,
    {
      name,
      attributes,
      priceConfiguration,
      categoryId,
      description,
      image,
      isPublish,
      tenantId,
    }: UpdateProductData,
  ) {
    const updatedData: Partial<Product> = {};

    if (name !== undefined) {
      updatedData.name = name;
    }
    if (description !== undefined) {
      updatedData.description = description;
    }
    if (image !== undefined) {
      updatedData.image = image;
    }
    if (attributes !== undefined) {
      updatedData.attributes = attributes;
    }
    if (priceConfiguration !== undefined) {
      updatedData.priceConfiguration = priceConfiguration;
    }
    if (categoryId !== undefined) {
      updatedData.categoryId = categoryId;
    }
    if (tenantId !== undefined) {
      updatedData.tenantId = tenantId;
    }
    if (isPublish !== undefined) {
      updatedData.isPublish = isPublish;
    }

    return this.productRepository.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true },
    );
  }

  async getProduct(id: mongoose.Types.ObjectId) {
    const result = await this.productRepository.aggregate<ProductWithCategory>([
      {
        $match: {
          _id: id,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                attributes: 1,
                priceConfiguration: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$category",
      },
    ]);

    return result[0] || null;
  }

  async getProducts(
    q: string,
    { categoryId, isPublish, tenantId }: ProductFilters,
    paginateQuery: PaginateQuery,
  ): Promise<AggregatePaginateResult<ProductWithCategory>> {
    const searchQueryRegexp = new RegExp(q, "i");

    const filters: ProductFilters = {};

    if (isPublish !== undefined) {
      filters.isPublish = isPublish;
    }
    if (tenantId !== undefined) {
      filters.tenantId = tenantId;
    }
    if (categoryId !== undefined) {
      filters.categoryId = categoryId;
    }

    const aggregate = this.productRepository.aggregate([
      {
        $match: {
          ...filters,
          $or: [
            { name: searchQueryRegexp },
            { description: searchQueryRegexp },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                attributes: 1,
                priceConfiguration: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$category",
      },
      { $sort: { createdAt: -1 } },
    ]);

    return this.productRepository.aggregatePaginate<ProductWithCategory>(
      aggregate,
      {
        ...paginateQuery,
      },
    );
  }

  async deleteProduct(id: mongoose.Types.ObjectId) {
    return this.productRepository.deleteOne({ _id: id });
  }
}
