import mongoose, {
  model,
  Schema,
  AggregatePaginateModel,
  HydratedDocument,
  InferSchemaType,
} from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

import {
  Category,
  CategoryAttribute,
  CategoryPriceConfigurationValue,
} from "./category-types";
import { PriceType, WidgetType } from "../common/types";

const priceConfigurationSchema = new Schema<CategoryPriceConfigurationValue>(
  {
    priceType: {
      type: String,
      enum: Object.values(PriceType),
      required: true,
    },
    availableOptions: {
      type: [String],
      required: true,
    },
  },
  {
    _id: false,
  },
);

const attributeSchema = new Schema<CategoryAttribute>(
  {
    name: { type: String, required: true },
    widgetType: {
      type: String,
      enum: Object.values(WidgetType),
      required: true,
    },
    defaultValue: { type: mongoose.Schema.Types.Mixed, required: true },
    availableOptions: { type: [String], required: true },
  },
  {
    _id: false,
  },
);

const categorySchmea = new Schema<Category>(
  {
    name: {
      type: String,
      required: true,
    },
    priceConfiguration: {
      type: Map,
      of: priceConfigurationSchema,
      required: true,
    },
    attributes: {
      type: [attributeSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchmea.plugin(aggregatePaginate);
export const CategoryModel = model<Category, AggregatePaginateModel<Category>>(
  "Category",
  categorySchmea,
);

export type CategoryDocument = HydratedDocument<
  InferSchemaType<typeof categorySchmea>
>;
