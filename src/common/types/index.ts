import { Request } from "express";

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
  };
}

export type AuthCookie = {
  accessToken: string;
};
