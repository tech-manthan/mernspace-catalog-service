import { Model } from "mongoose";
import { Category, CreateCategoryData } from "./category-types";

export class CategoryService {
  constructor(private catgoryRepository: Model<Category>) {
    this.create = this.create.bind(this);
  }

  async create({ attributes, name, priceConfiguration }: CreateCategoryData) {
    return await this.catgoryRepository.create({
      name,
      attributes,
      priceConfiguration,
    });
  }
}
