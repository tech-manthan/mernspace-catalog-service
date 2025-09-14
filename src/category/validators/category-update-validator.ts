import { checkSchema } from "express-validator";
import {
  CategoryAttribute,
  CreateCategoryData,
  CategoryPriceConfiguration,
} from "../category-types";
import { PriceType, WidgetType } from "../../common/types";

export default checkSchema(
  {
    name: {
      optional: true,
      isString: {
        errorMessage: "Category name must be a string",
        bail: true,
      },
      trim: true,
      notEmpty: {
        errorMessage: "Category name should not be empty",
        bail: true,
      },
      isLength: {
        options: {
          min: 3,
        },
        errorMessage: "Category name should be atleast 3 character",
      },
    },

    // priceConfiguration validation
    priceConfiguration: {
      optional: true,
      isObject: {
        errorMessage: "priceConfiguration must be an object",
        bail: true,
      },
      custom: {
        options: (value: CategoryPriceConfiguration) => {
          if (value && Object.keys(value).length === 0) {
            throw new Error("priceConfiguration cannot be empty if provided");
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
        bail: true,
      },
    },
    "priceConfiguration.*.availableOptions": {
      exists: {
        errorMessage: "priceConfiguration availableOptions is required",
        bail: true,
      },
      isArray: {
        errorMessage: "priceConfiguration availableOptions must be an array",
        bail: true,
      },
      custom: {
        options: (value: string[]) => {
          if (value && value.length === 0) {
            throw new Error(
              "priceConfiguration availableOptions cannot be empty",
            );
          }
          return true;
        },
      },
    },
    "priceConfiguration.*.availableOptions.*": {
      isString: {
        errorMessage:
          "priceConfiguration each availableOption must be a string",
        bail: true,
      },
      trim: true,
      notEmpty: {
        errorMessage:
          "Each priceConfiguration availableOption should not be empty",
      },
    },

    // attributes validation
    attributes: {
      optional: true,
      isArray: {
        errorMessage: "attributes must be an array",
        bail: true,
      },
      custom: {
        options: (value: CategoryAttribute[]) => {
          if (value && value.length === 0) {
            throw new Error("attributes cannot be empty if provided");
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
        bail: true,
      },
      trim: true,
      notEmpty: {
        errorMessage: "Attribute name cannot be empty",
        bail: true,
      },
    },
    "attributes.*.widgetType": {
      exists: {
        errorMessage: "attributes widgetType is required",
        bail: true,
      },
      isString: {
        errorMessage: "attribute widgetType must be a string",
        bail: true,
      },
      custom: {
        options: (value: WidgetType) =>
          Object.values(WidgetType).includes(value),
        errorMessage: `widgetType must be one of: ${Object.values(WidgetType).join(", ")}`,
        bail: true,
      },
    },
    "attributes.*.availableOptions": {
      exists: {
        errorMessage: "attributes availableOptions are required",
        bail: true,
      },
      isArray: {
        errorMessage: "attributes availableOptions must be an array",
        bail: true,
      },
      custom: {
        options: (value: string[]) => {
          if (value && value.length === 0) {
            throw new Error(
              "attributes availableOptions cannot be empty if provided",
            );
          }

          if (value.length < 2) {
            throw new Error(
              "attributes availableOptions atleast have two options",
            );
          }
          return true;
        },
      },
    },
    "attributes.*.availableOptions.*": {
      isString: {
        errorMessage: "Each attribute availableOption must be a string",
      },
      trim: true,
      notEmpty: {
        errorMessage: "Each attribute availableOption should not be empty",
      },
    },
    "attributes.*.defaultValue": {
      custom: {
        options: (value: string, { req }) => {
          if (value === null || value === undefined || value === "") {
            throw new Error("attribute default value is required");
          }

          const attribute = (req.body as CreateCategoryData).attributes.find(
            (attribute) => attribute.defaultValue === value,
          );

          if (!attribute || !attribute.availableOptions.includes(value)) {
            throw new Error(
              "attribute default value is not from available options",
            );
          }
          return true;
        },
      },
    },
  },
  ["body"],
);
