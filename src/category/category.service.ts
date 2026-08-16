import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";

import {
    CategoryRepository
} from "@/db";

import {
    CloudinaryService
} from "@/common";

import {
    CreateCategoryDto,
    UpdateCategoryDto
} from "./category.dto";
import { Types } from "mongoose";

@Injectable()
export class CategoryService {

    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async addCategory(
        body: CreateCategoryDto,
        userId: string
    ) {

        const {
            name,
            logo
        } = body;

        const categoryExists =
            await this.categoryRepository.exists({
                name,
                isDeleted: false
            });

        if (categoryExists) {
            throw new ConflictException(
                "Category already exists"
            );
        }

        let uploadedFile;

        try {

            uploadedFile =
                await this.cloudinaryService.uploadFile(
                    Buffer.from(logo, "base64"),
                    {
                        resource_type: "image"
                    }
                );

            const category =
                await this.categoryRepository.createDocument({

                    name,

                    logo: {
                        secure_url:
                            uploadedFile.secure_url,

                        public_id:
                            uploadedFile.public_id
                    },

                    createdBy: new Types.ObjectId(userId)
                });

            return category;

        } catch (error) {

            if (uploadedFile?.public_id) {

                await this.cloudinaryService.deleteFile(
                    uploadedFile.public_id
                );
            }

            throw error;
        }
    }

    async getCategories(
        page: number = 1,
        limit: number = 10
    ) {

        return await this.categoryRepository.paginateModel(
            {
                isDeleted: false
            },
            page,
            limit
        );
    }

    async getCategoryById(
        categoryId: string
    ) {

        const category =
            await this.categoryRepository.findOneDocument({
                _id: categoryId,
                isDeleted: false
            });

        if (!category) {
            throw new NotFoundException(
                "Category not found"
            );
        }

        return category;
    }

    async updateCategory(
        categoryId: string,
        body: UpdateCategoryDto,
        userId: string
    ) {

        const category =
            await this.categoryRepository.findOneDocument({
                _id: categoryId,
                createdBy: new Types.ObjectId(userId),
                isDeleted: false
            });

        if (!category) {
            throw new ForbiddenException(
                "You are not allowed to update this category"
            );
        }

        if (body.name !== undefined) {

            const categoryExists =
                await this.categoryRepository.exists({
                    name: body.name,
                    isDeleted: false,
                    _id: {
                        $ne: categoryId
                    }
                });

            if (categoryExists) {
                throw new ConflictException(
                    "Category already exists"
                );
            }
        }

        const updateData: any = {};

        if (body.name !== undefined) {
            updateData.name = body.name;
        }

        let uploadedFile;

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

        if (
            Object.keys(updateData).length === 0
        ) {
            throw new BadRequestException(
                "No data provided for update"
            );
        }

        try {

            const updatedCategory =
                await this.categoryRepository.findByIdAndUpdate(
                    categoryId,
                    updateData
                );

            if (
                uploadedFile?.public_id &&
                category.logo?.public_id
            ) {

                await this.cloudinaryService.deleteFile(
                    category.logo.public_id
                );
            }

            return updatedCategory;

        } catch (error) {

            if (uploadedFile?.public_id) {

                await this.cloudinaryService.deleteFile(
                    uploadedFile.public_id
                );
            }

            throw error;
        }
    }

    async deleteCategory(
        categoryId: string,
        userId: string
    ) {

        const category =
            await this.categoryRepository.findOneDocument({
                _id: categoryId,
                createdBy: new Types.ObjectId(userId),
                isDeleted: false
            });

        if (!category) {
            throw new ForbiddenException(
                "You are not allowed to delete this category"
            );
        }

        return await this.categoryRepository.findByIdAndUpdate(
            categoryId,
            {
                isDeleted: true
            }
        );
    }
}