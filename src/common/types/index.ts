import { Request } from "express";
import mongoose from "mongoose";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  MANAGER = "manager",
}

export interface AuthRequest extends Request {
  auth: {
    id: number;
    role: UserRole;
    refreshTokenId: number;
    tenant: string;
  };
}

export type AuthCookie = {
  accessToken: string;
};

export interface PaginateQuery {
  page: number;
  limit: number;
}

export interface IdParams {
  id: mongoose.Types.ObjectId;
}

export enum PriceType {
  base = "base",
  additional = "additional",
}
export enum WidgetType {
  switch = "switch",
  radio = "radio",
}

export type WithId<T> = T & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};
