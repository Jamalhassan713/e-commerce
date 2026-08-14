import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }


    async uploadFile(
        file: Buffer,
        options?: UploadApiOptions
    ): Promise<UploadApiResponse> {
        return new Promise<UploadApiResponse>((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {

                    if (error) {
                        const uploadError: Error =
                            error instanceof Error
                                ? error
                                : new Error(
                                    typeof error === 'string'
                                        ? error
                                        : JSON.stringify(error)
                                );

                        reject(uploadError);
                        return;
                    }

                    if (!result) {
                        reject(new Error('Cloudinary upload failed'));
                        return;
                    }

                    resolve(result);
                }
            );

            Readable.from(file).pipe(uploadStream);
        });
    }



    async deleteFile(publicId: string): Promise<any> {
        return await cloudinary.uploader.destroy(publicId);
    }

    async uploadMultipleFiles(files: Buffer[], options?: UploadApiOptions): Promise<UploadApiResponse[]> {
        return Promise.all(files.map(file => this.uploadFile(file, options)));
    }

    async deleteMultipleFiles(publicIds: string[]): Promise<any[]> {
        return Promise.all(publicIds.map(publicId => this.deleteFile(publicId)));
    }
}