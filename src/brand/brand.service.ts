import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BrandRepository } from "@/db";
import { CloudinaryService } from "@/common";
import { createBrandDto, updateBrandDto } from "./brand.dto";


@Injectable()
export class BrandService {

    constructor(
        private readonly brandRepository: BrandRepository,
        private readonly cloudinaryService: CloudinaryService
    ) { }
    async addBrand(body: createBrandDto, userId: string) {

        const { name, logo } = body;
        const brandExists = await this.brandRepository.exists({
            name,
            isDeleted: false
        });

        if (brandExists) throw new ConflictException("Brand already exists");
        let uploadedFile;

        if (logo) {
            uploadedFile = await this.cloudinaryService.uploadFile(
                Buffer.from(logo, "base64"),
                {
                    resource_type: "image"
                }
            );
        }
        try {
            const brand = await this.brandRepository.createDocument({

                name,
                ...(uploadedFile && {
                    logo: {
                        secure_url: uploadedFile.secure_url,
                        public_id: uploadedFile.public_id
                    }
                }),
                createdBy: userId
            });
            return brand;

        } catch (error) {
            if (uploadedFile?.public_id) {
                await this.cloudinaryService.deleteFile(
                    uploadedFile.public_id
                );
            }
            throw error;
        }
    }

    async getBrands(page: number = 1, limit: number = 10) {

        return await this.brandRepository.paginateModel(
            {
                isDeleted: false
            },
            page,
            limit
        );
    }

    async getBrandById(brandId: string) {
        const brand = await this.brandRepository.findOneDocument({
            _id: brandId,
            isDeleted: false
        });
        if (!brand) throw new NotFoundException("Brand not found ");
        return brand;
    }

    async updateBrand(brandId: string, body: updateBrandDto, userId: string) {

        const brand = await this.brandRepository.findOneDocument({
            _id: brandId,
            isDeleted: false
        });
        if (!brand) throw new NotFoundException("Brand not found");


        if (body.name !== undefined) {
            const brandExists = await this.brandRepository.exists({
                name: body.name,
                isDeleted: false,
                _id: {
                    $ne: brandId
                }
            });
            if (brandExists) throw new ConflictException("Brand already exists");
        }
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;

        let uploadedFile;

        if (body.logo !== undefined) {

            uploadedFile = await this.cloudinaryService.uploadFile(
                Buffer.from(body.logo, "base64"),
                {
                    resource_type: "image"
                }
            );
            updateData.logo = {
                secure_url: uploadedFile.secure_url,
                public_id: uploadedFile.public_id
            };
        }


        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException("No data provided for update");
        }
        try {
            const updatedBrand = await this.brandRepository.findByIdAndUpdate(
                brandId,
                updateData
            );
            if (uploadedFile?.public_id && brand.logo?.public_id) {

                await this.cloudinaryService.deleteFile(
                    brand.logo.public_id
                );

            }
            return updatedBrand;

        } catch (error) {

            if (uploadedFile?.public_id) {
                await this.cloudinaryService.deleteFile(
                    uploadedFile.public_id
                );
            }
            throw error;
        }
    }
    async deleteBrand(brandId: string, userId: string) {

        const brand = await this.brandRepository.findOneDocument({
            _id: brandId,
            isDeleted: false
        });
        if (!brand) throw new NotFoundException("Brand not found");
        return await this.brandRepository.findByIdAndUpdate(
            brandId,
            {
                isDeleted: true
            }
        );
    }
}