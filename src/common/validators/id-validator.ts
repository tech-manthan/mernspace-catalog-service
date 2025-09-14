import { checkSchema, Schema } from "express-validator";
import mongoose from "mongoose";

export default function idValidator(
  entityName: string,
  location: ("query" | "body" | "params")[] = ["params"],
) {
  const schema: Schema = {
    id: {
      exists: {
        errorMessage: `${entityName} id is required in params`,
        bail: true,
      },
      custom: {
        options: (value: string) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error(`Invalid ${entityName} id`);
          }
          return true;
        },
      },
      customSanitizer: {
        options: (value: string) => new mongoose.Types.ObjectId(value),
      },
    },
  };

  return checkSchema(schema, location);
}
