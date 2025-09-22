import config from "config";
import { FileData, FileStorage } from "../types/storage";
import { v2 as cloudinary, ImageFormat, VideoFormat } from "cloudinary";

type ResourceType = "image" | "video" | "raw" | "auto";

export class CloudinaryStorage implements FileStorage {
  private folderName: string;
  private resource_type: ResourceType;
  private format: ImageFormat | VideoFormat;

  constructor(
    folderName: string,
    resource_type: ResourceType = "auto",
    getFormat: ImageFormat | VideoFormat = "",
  ) {
    this.folderName = folderName;
    this.resource_type = resource_type;
    this.format = getFormat;

    cloudinary.config({
      cloud_name: config.get("cloudinary.cloud_name"),
      api_key: config.get("cloudinary.api_key"),
      api_secret: config.get("cloudinary.api_secret"),
    });
  }

  async upload(data: FileData): Promise<void> {
    await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: data.filename,
            folder: this.folderName,
            resource_type: this.resource_type,
          },
          (error, result) => {
            if (error) return reject(new Error(error.message));
            resolve(result);
          },
        )
        .end(data.fileData); // Buffer from express-fileupload
    });
  }

  async delete(fileName: string): Promise<void> {
    await cloudinary.uploader.destroy(`${this.folderName}/${fileName}`, {
      invalidate: true,
    });
  }

  getObjectUri(filename: string): string {
    return cloudinary.url(`${this.folderName}/${filename}`, {
      secure: true,
      format: this.format,
    });
  }
}
