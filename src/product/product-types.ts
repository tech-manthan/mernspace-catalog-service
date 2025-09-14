import { Types } from "mongoose";

export interface Product {
  name: string;
  categoryId: Types.ObjectId;
}
