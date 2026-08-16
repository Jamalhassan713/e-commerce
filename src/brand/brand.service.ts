import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";

import { BrandRepository } from "@/db";
import { CloudinaryService } from "@/common";

import {
    createBrandDto,
    updateBrandDto
} from "./brand.dto";


@Injectable()
export class BrandService {

    constructor(
        private readonly brandRepository: BrandRepository,
        private readonly cloudinaryService: CloudinaryService
    ) {}


    // Create Brand
    async addBrand(
        body: createBrandDto,
        userId: string
    ) {

        const { name, logo } = body;


        // Check if an active brand with the same name exists
        const brandExists =
            await this.brandRepository.exists({
                name,
                isDeleted: false
            });


        if (brandExists) {
            throw new ConflictException(
                "Brand already exists"
            );
        }


        let uploadedFile;


        // Upload logo to Cloudinary
        if (logo) {

            uploadedFile =
                await this.cloudinaryService.uploadFile(
                    Buffer.from(logo, "base64"),
                    {
                        resource_type: "image"
                    }
                );

        }


        try {

            const brand =
                await this.brandRepository.createDocument({

                    name,

                    ...(uploadedFile && {
                        logo: {
                            secure_url:
                                uploadedFile.secure_url,

                            public_id:
                                uploadedFile.public_id
                        }
                    }),

                    createdBy: userId

                });


            return brand;

        } catch (error) {

            // If database creation fails,
            // delete the uploaded image from Cloudinary
            if (uploadedFile?.public_id) {

                await this.cloudinaryService.deleteFile(
                    uploadedFile.public_id
                );

            }

            throw error;
        }
    }


    // Get All Brands
    async getBrands(
        page: number = 1,
        limit: number = 10
    ) {

        return await this.brandRepository.paginateModel(
            {
                isDeleted: false
            },
            page,
            limit
        );

    }


    // Get Brand By ID
    async getBrandById(
        brandId: string
    ) {

        const brand =
            await this.brandRepository.findOneDocument({
                _id: brandId,
                isDeleted: false
            });


        if (!brand) {

            throw new NotFoundException(
                "Brand not found"
            );

        }


        return brand;
    }


    // Update Brand
    async updateBrand(
        brandId: string,
        body: updateBrandDto,
        userId: string
    ) {

        /*
         * Get the brand only if:
         * 1. It exists
         * 2. It is not deleted
         * 3. It belongs to the current user
         */

        const brand =
            await this.brandRepository.findOneDocument({

                _id: brandId,

                createdBy: userId,

                isDeleted: false

            });


        if (!brand) {

            throw new ForbiddenException(
                "You are not allowed to update this brand"
            );

        }


        // Check duplicate brand name
        if (body.name !== undefined) {

            const brandExists =
                await this.brandRepository.exists({

                    name: body.name,

                    isDeleted: false,

                    _id: {
                        $ne: brandId
                    }

                });


            if (brandExists) {

                throw new ConflictException(
                    "Brand already exists"
                );

            }

        }


        const updateData: any = {};


        // Update name
        if (body.name !== undefined) {

            updateData.name = body.name;

        }


        let uploadedFile;


        // Upload new logo
        if (body.logo !== undefined) {

            uploadedFile =
                await this.cloudinaryService.uploadFile(
                    Buffer.from(body.logo, "base64"),
                    {
                        resource_type: "image"
                    }
                );


            updateData.logo = {

                secure_url:
                    uploadedFile.secure_url,

                public_id:
                    uploadedFile.public_id

            };

        }


        if (Object.keys(updateData).length === 0) {

            throw new BadRequestException(
                "No data provided for update"
            );

        }


        try {

            const updatedBrand =
                await this.brandRepository.findByIdAndUpdate(
                    brandId,
                    updateData
                );


            /*
             * Delete the old logo only after
             * the database update succeeds.
             */
            if (
                uploadedFile?.public_id &&
                brand.logo?.public_id
            ) {

                await this.cloudinaryService.deleteFile(
                    brand.logo.public_id
                );

            }


            return updatedBrand;

        } catch (error) {

            /*
             * Database update failed,
             * so delete the newly uploaded image.
             */
            if (uploadedFile?.public_id) {

                await this.cloudinaryService.deleteFile(
                    uploadedFile.public_id
                );

            }

            throw error;
        }
    }


    // Delete Brand
    async deleteBrand(
        brandId: string,
        userId: string
    ) {

        /*
         * Only the owner can delete the brand.
         */
        const brand =
            await this.brandRepository.findOneDocument({

                _id: brandId,

                createdBy: userId,

                isDeleted: false

            });


        if (!brand) {

            throw new ForbiddenException(
                "You are not allowed to delete this brand"
            );

        }


        /*
         * Soft delete.
         *
         * We don't delete the Cloudinary image
         * because the brand still exists in the database
         * and could be restored later.
         */
        return await this.brandRepository.findByIdAndUpdate(
            brandId,
            {
                isDeleted: true
            }
        );
    }
}