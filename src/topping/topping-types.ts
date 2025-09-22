import mongoose, { Types } from "mongoose";
import { Request } from "express";
import { WithId } from "../common/types";

export interface Topping {
  name: string;
  image: string;
  price: number;
  tenantId: string;
  categoryId: Types.ObjectId;
  isPublish: boolean;
}

interface CreateToppingBase {
  name: string;
  price: number;
  tenantId: string;
  categoryId: Types.ObjectId;
  isPublish?: boolean | undefined;
}

export type CreateToppingBody = CreateToppingBase;

export interface CreateToppingData extends CreateToppingBase {
  image: string;
}

interface UpdateToppingBase {
  name?: string | undefined;
  price?: number | undefined;
  tenantId?: string | undefined;
  categoryId?: Types.ObjectId | undefined;
  isPublish?: boolean | undefined;
}

export type UpdateToppingBody = UpdateToppingBase;

export interface UpdateToppingData extends UpdateToppingBase {
  image?: string | undefined;
}

export interface CreateToppingRequest extends Request {
  body: CreateToppingBody;
}

export interface UpdateToppingRequest extends Request {
  body: UpdateToppingBody;
}

export interface ToppingFilters {
  tenantId?: string | undefined;
  categoryId?: mongoose.Types.ObjectId | undefined;
  isPublish?: boolean | undefined;
}

export interface ToppingValidFilters extends ToppingFilters {
  q: string;
  currentPage: number;
  perPage: number;
}

export type ToppingLean = WithId<Topping>;
