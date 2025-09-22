import mongoose, {
  AggregatePaginateModel,
  AggregatePaginateResult,
} from "mongoose";
import {
  CreateToppingData,
  Topping,
  ToppingFilters,
  UpdateToppingData,
} from "./topping-types";
import { PaginateQuery } from "../common/types";

export class ToppingService {
  constructor(private toppingRepository: AggregatePaginateModel<Topping>) {}

  async create({
    name,
    price,
    categoryId,
    image,
    tenantId,
    isPublish,
  }: CreateToppingData) {
    return this.toppingRepository.create({
      name,
      price,
      image,
      tenantId,
      categoryId,
      isPublish: isPublish ? isPublish : false,
    });
  }

  async update(
    id: mongoose.Types.ObjectId,
    { name, price, categoryId, image, isPublish, tenantId }: UpdateToppingData,
  ) {
    const updatedData: Partial<Topping> = {};

    if (name !== undefined) {
      updatedData.name = name;
    }
    if (price !== undefined) {
      updatedData.price = price;
    }
    if (image !== undefined) {
      updatedData.image = image;
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

    return this.toppingRepository.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true },
    );
  }

  async getTopping(id: mongoose.Types.ObjectId) {
    return this.toppingRepository.findById(id);
  }

  async getToppings(
    q: string,
    { categoryId, isPublish, tenantId }: ToppingFilters,
    paginateQuery: PaginateQuery,
  ): Promise<AggregatePaginateResult<Topping>> {
    const searchQueryRegexp = new RegExp(q, "i");

    const filters: ToppingFilters = {};

    if (isPublish !== undefined) {
      filters.isPublish = isPublish;
    }
    if (tenantId !== undefined) {
      filters.tenantId = tenantId;
    }
    if (categoryId !== undefined) {
      filters.categoryId = categoryId;
    }

    const aggregate = this.toppingRepository.aggregate([
      {
        $match: {
          ...filters,
          name: searchQueryRegexp,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return this.toppingRepository.aggregatePaginate<Topping>(aggregate, {
      ...paginateQuery,
    });
  }

  async deleteTopping(id: mongoose.Types.ObjectId) {
    return this.toppingRepository.deleteOne({ _id: id });
  }
}
