import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { AggregatePaginateModel, model, Schema } from "mongoose";
import { Topping } from "./topping-types";

const toppingSchema = new Schema<Topping>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
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

toppingSchema.plugin(aggregatePaginate);
export const ToppingModel = model<Topping, AggregatePaginateModel<Topping>>(
  "Topping",
  toppingSchema,
);
