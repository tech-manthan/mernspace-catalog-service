import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { AggregatePaginateModel, model, Schema } from "mongoose";

import {
  Product,
  ProductAttribute,
  ProductPriceConfigurationValue,
} from "./product-types";
import { PriceType } from "../common/types";

const priceConfigurationSchema = new Schema<ProductPriceConfigurationValue>(
  {
    priceType: {
      type: String,
      enum: Object.values(PriceType),
      required: true,
    },
    availableOptions: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const attributeSchema = new Schema<ProductAttribute>(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
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
    tenantId: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isPublish: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.plugin(aggregatePaginate);
export const ProductModel = model<Product, AggregatePaginateModel<Product>>(
  "Product",
  productSchema,
);
