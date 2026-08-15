import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BrandRepository } from "@/db";
import { createBrandDto, updateBrandDto } from "./brand.dto";

@Injectable()
export class BrandService {

    constructor(
        private readonly brandRepository: BrandRepository
    ) { }

    async createBrand(body: createBrandDto, userId: string) {

        const { name, logo } = body;
        const brandExists = await this.brandRepository.exists({ name });
        if (brandExists) throw new ConflictException("Brand already exists");

        return await this.brandRepository.createDocument({
            name,
            logo,
            createdBy: userId as any,
        });
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
        if (!brand) throw new NotFoundException("Brand not found");
        return brand;
    }

    async updateBrand(brandId: string, body: updateBrandDto) {

        const brand = await this.brandRepository.findById(brandId);
        if (!brand) throw new NotFoundException("Brand not found");

        if (body.name !== undefined) {

            const brandExists = await this.brandRepository.exists({
                name: body.name,
                isDeleted: false,
                _id: { $ne: brandId }
            });

            if (brandExists) {
                throw new ConflictException(
                    "Brand already exists"
                );
            }
        }

        const updateData: any = {};

        if (body.name !== undefined) {
            updateData.name = body.name;
        }

        if (body.logo !== undefined) {
            updateData.logo = body.logo;
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException("No data provided for update");
        }

        return await this.brandRepository.findByIdAndUpdate(
            brandId,
            updateData
        );
    }

    async deleteBrand(brandId: string) {

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