import { checkSchema } from "express-validator";
import mongoose from "mongoose";

const toObjectId = (value: string) => {
  if (!value) return undefined;
  if (!mongoose.Types.ObjectId.isValid(value)) return undefined;
  return new mongoose.Types.ObjectId(value);
};

export default checkSchema(
  {
    q: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          return value || "";
        },
      },
    },
    currentPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return Number.isNaN(parsedValue) ? 1 : parsedValue;
        },
      },
    },
    perPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return Number.isNaN(parsedValue) ? 10 : parsedValue;
        },
      },
    },
    tenantId: {
      optional: true,
      isInt: {
        errorMessage: "tenantId must be an integer",
        bail: true,
      },
      toInt: true,
      customSanitizer: {
        options: (value: unknown) => String(value) || "",
      },
    },

    categoryId: {
      optional: true,
      isString: {
        errorMessage: "categoryId must be a string",
        bail: true,
      },
      custom: {
        options: (value: string) => {
          if (value && !mongoose.Types.ObjectId.isValid(value)) {
            throw new Error("categoryId must be a valid Mongo ObjectId");
          }
          return true;
        },
      },
      customSanitizer: {
        options: (value: string) => toObjectId(value),
      },
    },
    isPublish: {
      optional: true,
      customSanitizer: {
        options: (value: unknown) => {
          if (value === undefined || value === null || value === "") {
            return undefined;
          }
          return value === "true" || value === true;
        },
      },
      isBoolean: {
        errorMessage: "isPublish must be a boolean",
      },
    },
  },
  ["query"],
);
