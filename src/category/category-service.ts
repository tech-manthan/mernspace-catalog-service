import mongoose, {
  AggregatePaginateModel,
  AggregatePaginateResult,
  Model,
} from "mongoose";
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "./category-types";
import { PaginateQuery } from "../common/types";
import { Product } from "../product/product-types";
import { CategoryDocument } from "./category-model";

export class CategoryService {
  constructor(
    private catgoryRepository: AggregatePaginateModel<Category>,
    private productRepository: Model<Product>,
  ) {
    this.create = this.create.bind(this);
  }

  async create({ attributes, name, priceConfiguration }: CreateCategoryData) {
    return this.catgoryRepository.create({
      name,
      attributes,
      priceConfiguration,
    });
  }

  async update(
    id: mongoose.Types.ObjectId,
    { name, attributes, priceConfiguration }: UpdateCategoryData,
  ) {
    const updatedData: Partial<Category> = {};

    if (name !== undefined) {
      updatedData.name = name;
    }
    if (attributes !== undefined) {
      updatedData.attributes = attributes;
    }
    if (priceConfiguration !== undefined) {
      updatedData.priceConfiguration = priceConfiguration;
    }

    return this.catgoryRepository.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true },
    );
  }

  async getCategory(id: mongoose.Types.ObjectId) {
    return this.catgoryRepository.findById(id).lean();
  }

  async getCategories(
    q: string,
    paginateQuery: PaginateQuery,
  ): Promise<AggregatePaginateResult<CategoryDocument>> {
    const searchQueryRegexp = new RegExp(q, "i");

    const aggregate = this.catgoryRepository.aggregate([
      { $match: { name: searchQueryRegexp } },
      { $sort: { createdAt: -1 } },
    ]);

    return this.catgoryRepository.aggregatePaginate<CategoryDocument>(
      aggregate,
      {
        ...paginateQuery,
      },
    );
  }

  async deleteCategory(id: mongoose.Types.ObjectId) {
    const isUsed = await this.productRepository.exists({ categoryId: id });

    if (isUsed) {
      throw new Error(
        "Category is being used by products and cannot be deleted",
      );
    }

    return this.catgoryRepository.deleteOne({ _id: id });
  }
}
