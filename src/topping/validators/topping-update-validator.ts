import { checkSchema } from "express-validator";
import mongoose from "mongoose";
import { FileArray } from "express-fileupload";

export default checkSchema(
  {
    name: {
      optional: true,
      isString: {
        errorMessage: "Topping name must be a string",
        bail: true,
      },
      trim: true,
      notEmpty: {
        errorMessage: "Topping name cannot be empty",
      },
      isLength: {
        options: { min: 3 },
        errorMessage: "Topping name must be at least 3 characters",
      },
    },
    description: {
      optional: true,
      isNumeric: {
        errorMessage: "Topping price must be a number",
      },
    },

    // image
    image: {
      optional: true,
      custom: {
        options: (_: unknown, { req }) => {
          const files = req.files as FileArray;

          if (!files || Object.keys(files).length === 0) {
            throw new Error("Topping image is required if provided");
          }

          const uploaded = files["image"];

          if (!uploaded) {
            throw new Error("Topping image is required if provided");
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
      toInt: true,
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
  },
  ["body"],
);
