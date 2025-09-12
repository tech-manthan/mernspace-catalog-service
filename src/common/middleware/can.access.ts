import { NextFunction, Request, Response } from "express";

import createHttpError from "http-errors";
import logger from "../utils/logger";
import { AuthRequest, UserRole } from "../types";

export default function canAccess(roles: UserRole[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { role } = (req as AuthRequest).auth;

    if (!roles.includes(role)) {
      logger.error("Unauthorized resource");
      const err = createHttpError(403, "Unauthorized Access");
      next(err);
    } else {
      next();
    }
  };
}
