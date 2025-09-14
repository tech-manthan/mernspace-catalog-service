// Model Types

import { Request } from "express";
import { PriceType, WidgetType, WithId } from "../common/types";

export interface CategoryPriceConfigurationValue {
  priceType: PriceType;
  availableOptions: string[];
}

export interface CategoryPriceConfiguration {
  [key: string]: CategoryPriceConfigurationValue;
}

export interface CategoryAttribute {
  name: string;
  widgetType: WidgetType;
  defaultValue: string;
  availableOptions: string[];
}

export interface Category {
  name: string;
  priceConfiguration: CategoryPriceConfiguration;
  attributes: CategoryAttribute[];
}

export type CategoryLean = WithId<Category>;

// Category Request Types

export interface CreateCategoryData {
  name: string;
  priceConfiguration: CategoryPriceConfiguration;
  attributes: CategoryAttribute[];
}

export interface UpdateCategoryData {
  name: string | undefined;
  priceConfiguration: CategoryPriceConfiguration | undefined;
  attributes: CategoryAttribute[] | undefined;
}

export interface CreateCategoryRequest extends Request {
  body: CreateCategoryData;
}

export interface UpdateCategoryRequest extends Request {
  body: UpdateCategoryData;
}

export interface CategoryFilter {
  q: string;
  currentPage: number;
  perPage: number;
}
