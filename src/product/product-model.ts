import { model, Schema } from "mongoose";
import { Product } from "./product-types";

const productSchema = new Schema<Product>({});

export const ProductModel = model<Product>("Product", productSchema);
