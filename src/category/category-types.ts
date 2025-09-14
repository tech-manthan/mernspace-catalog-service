// Model Types

import { Request } from "express";

export enum PriceType {
  base = "base",
  additional = "additional",
}
export enum WidgetType {
  switch = "switch",
  radio = "radio",
}
export interface PriceConfigurationValue {
  priceType: PriceType;
  availableOptions: string[];
}

export interface PriceConfiguration {
  [key: string]: PriceConfigurationValue;
}

export interface Attribute {
  name: string;
  widgetType: WidgetType;
  defaultValue: string;
  availableOptions: string[];
}

export interface Category {
  name: string;
  priceConfiguration: PriceConfiguration;
  attributes: Attribute[];
}

// Category Request Types

export interface CreateCategoryData {
  name: string;
  priceConfiguration: PriceConfiguration;
  attributes: Attribute[];
}

export interface UpdateCategoryData {
  name: string | undefined;
  priceConfiguration: PriceConfiguration | undefined;
  attributes: Attribute[] | undefined;
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
