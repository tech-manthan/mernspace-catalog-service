import mongoose, { Types } from "mongoose";
import { PriceType, WithId } from "../common/types";
import { Request } from "express";
import { CategoryLean } from "../category/category-types";

export interface ProductPriceConfigurationValue {
  priceType: PriceType;
  availableOptions: {
    [key: string]: number;
  };
}

export interface ProductPriceConfiguration {
  [key: string]: ProductPriceConfigurationValue;
}

export interface ProductAttribute {
  name: string;
  value: unknown;
}

export interface Product {
  name: string;
  description: string;
  image: string;
  priceConfiguration: ProductPriceConfiguration;
  attributes: ProductAttribute[];
  tenantId: string;
  categoryId: Types.ObjectId;
  isPublish: boolean;
}

interface CreateProductBase {
  name: string;
  description: string;
  priceConfiguration: ProductPriceConfiguration;
  attributes: ProductAttribute[];
  tenantId: string;
  categoryId: Types.ObjectId;
  isPublish?: boolean | undefined;
}

export type CreateProductBody = CreateProductBase;

export interface CreateProductData extends CreateProductBase {
  image: string;
}

export interface UpdateProductBase {
  name?: string | undefined;
  description?: string | undefined;
  priceConfiguration?: ProductPriceConfiguration | undefined;
  attributes?: ProductAttribute[] | undefined;
  tenantId?: string | undefined;
  categoryId?: Types.ObjectId | undefined;
  isPublish?: boolean | undefined;
}

export type UpdateProductBody = UpdateProductBase;

export interface UpdateProductData extends UpdateProductBase {
  image?: string | undefined;
}

export interface CreateProductRequest extends Request {
  body: CreateProductBody;
}

export interface UpdateProductRequest extends Request {
  body: UpdateProductBody;
}

export enum ProductEvents {
  PRODUCT_CREATE = "PRODUCT_CREATE",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PRODUCT_DELETE = "PRODUCT_DELETE",
}

export interface ProductFilters {
  tenantId?: string | undefined;
  categoryId?: mongoose.Types.ObjectId | undefined;
  isPublish?: boolean | undefined;
}

export interface ProductValidFilters extends ProductFilters {
  q: string;
  currentPage: number;
  perPage: number;
}

export type ProductLean = WithId<Product>;

export type ProductWithCategory = ProductLean & {
  category: CategoryLean;
};
