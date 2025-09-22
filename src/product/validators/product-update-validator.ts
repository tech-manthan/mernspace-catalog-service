import { checkSchema } from "express-validator";
import mongoose from "mongoose";
import { ProductAttribute, ProductPriceConfiguration } from "../product-types";
import { PriceType } from "../../common/types";
import { FileArray } from "express-fileupload";

export default checkSchema(
  {
    name: {
      optional: true,
      isString: {
        errorMessage: "Product name must be a string",
        bail: true,
      },
      trim: true,
      notEmpty: {
        errorMessage: "Product name cannot be empty",
      },
      isLength: {
        options: { min: 3 },
        errorMessage: "Product name must be at least 3 characters",
      },
    },
    description: {
      optional: true,
      isString: {
        errorMessage: "Product description must be a string",
      },
      trim: true,
      notEmpty: {
        errorMessage: "Product description cannot be empty",
      },
      isLength: {
        options: { min: 20 },
        errorMessage: "Product description must be at least 20 characters",
      },
    },

    // image
    image: {
      optional: true,
      custom: {
        options: (_: unknown, { req }) => {
          const files = req.files as FileArray;

          if (!files || Object.keys(files).length === 0) {
            throw new Error("Product image is required if provided");
          }

          const uploaded = files["image"];

          if (!uploaded) {
            throw new Error("Product image is required if provided");
          }
          const fileArray = Array.isArray(uploaded) ? uploaded : [uploaded];

          for (const file of fileArray) {
            if (
              !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
            ) {
              throw new Error(
                "Invalid file type. Only JPEG, PNG, and WEBP are allowed",
              );
            }
          }

          return true;
        },
      },
    },

    // tenantId
    tenantId: {
      optional: true,
      isInt: {
        errorMessage: "tenantId must be an integer",
        bail: true,
      },
      customSanitizer: {
        options: (value: number) => String(value),
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
        options: (value: string) => new mongoose.Types.ObjectId(value),
      },
    },
    isPublish: {
      optional: true,
      isBoolean: {
        errorMessage: "isPublish must be a boolean",
      },
    },
    priceConfiguration: {
      optional: true,
      custom: {
        options: (value: ProductPriceConfiguration) => {
          if (!value || Object.keys(value).length === 0) {
            throw new Error("priceConfiguration cannot be empty");
          }
          return true;
        },
      },
    },
    "priceConfiguration.*.priceType": {
      exists: {
        errorMessage: "priceConfiguration priceType is required",
        bail: true,
      },
      isString: {
        errorMessage: "priceType must be a string",
        bail: true,
      },
      custom: {
        options: (value: PriceType) => Object.values(PriceType).includes(value),
        errorMessage: `priceType must be one of: ${Object.values(PriceType).join(", ")}`,
      },
    },
    "priceConfiguration.*.availableOptions": {
      exists: {
        errorMessage: "priceConfiguration availableOptions is required",
        bail: true,
      },
      isObject: {
        errorMessage:
          "priceConfiguration availableOptions must be an object (Map<string, number>)",
        bail: true,
      },
      custom: {
        options: (value: Record<string, number>) => {
          if (!value || Object.keys(value).length === 0) {
            throw new Error("availableOptions cannot be empty");
          }
          for (const [key, v] of Object.entries(value)) {
            if (typeof key !== "string" || typeof v !== "number") {
              throw new Error(
                "availableOptions must be { [key: string]: number }",
              );
            }
          }
          return true;
        },
      },
    },
    attributes: {
      optional: true,
      custom: {
        options: (value: ProductAttribute[]) => {
          if (!value || value.length === 0) {
            throw new Error("attributes cannot be empty");
          }
          return true;
        },
      },
    },
    "attributes.*.name": {
      exists: {
        errorMessage: "Attribute name is required",
        bail: true,
      },
      isString: {
        errorMessage: "Attribute name must be a string",
      },
      trim: true,
      notEmpty: {
        errorMessage: "Attribute name cannot be empty",
      },
    },
    "attributes.*.value": {
      exists: {
        errorMessage: "Attribute value is required",
        bail: true,
      },
      custom: {
        options: (value) => {
          if (value === undefined || value === null) {
            throw new Error("Attribute value cannot be null or undefined");
          }
          return true;
        },
      },
    },
  },
  ["body"],
);
