import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { UploadApiResponse } from "cloudinary";
import { BrandRepository, CategoryRepository, ProductRepository } from "@/db";
import { CloudinaryService } from "@/common";
import { CreateProductDto, UpdateProductDto } from "./product.dto";

@Injectable()
export class ProductService {

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly brandRepository: BrandRepository,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    async addProduct(body: CreateProductDto, userId: string) {

        const { title, overview, price, discount = 0, stock = 0, category, brand, images } = body;

        const categoryExists = await this.categoryRepository.exists({
            _id: category,
            isDeleted: false
        });

        if (!categoryExists) throw new NotFoundException("Category not found");
        const brandExists = await this.brandRepository.exists({
            _id: brand,
            isDeleted: false
        });
        if (!brandExists) throw new NotFoundException("Brand not found");

        const productExists = await this.productRepository.exists({
            title,
            isDeleted: false
        });
        if (productExists) throw new ConflictException("Product already exists");

        const uploadedFiles: UploadApiResponse[] = [];

        try {

            if (images?.length) {

                const uploaded =
                    await this.cloudinaryService.uploadMultipleFiles(
                        images.map(image =>
                            Buffer.from(image, "base64")
                        ),
                        {
                            resource_type: "image"
                        }
                    );

                uploadedFiles.push(...uploaded);
            }

            const product = await this.productRepository.createDocument({

                title,
                overview,
                price,
                discount,
                finalPrice: price - (price * (discount / 100)),
                stock,
                images: uploadedFiles.map(file => ({
                    secure_url: file.secure_url,
                    public_id: file.public_id
                })),

                createdBy: new Types.ObjectId(userId),
                category: new Types.ObjectId(category),
                brand: new Types.ObjectId(brand)
            });
            return product;

        } catch (error) {

            if (uploadedFiles.length) {
                await this.cloudinaryService.deleteMultipleFiles(
                    uploadedFiles.map(
                        file => file.public_id
                    )
                );
            }
            throw error;
        }
    }

    async getProducts(page: number = 1, limit: number = 10) {

        return await this.productRepository.paginateModel(
            {
                isDeleted: false,
                isActive: true
            },
            page,
            limit,
            undefined,
            {
                populate: [
                    {
                        path: "category",
                        select: "name slug"
                    },
                    {
                        path: "brand",
                        select: "name slug logo"
                    }
                ]
            }
        );
    }

    async getProductById(productId: string) {

        const product = await this.productRepository.findOneDocument(
            {
                _id: productId,
                isDeleted: false,
                isActive: true
            },
            undefined,
            {
                populate: [
                    {
                        path: "category",
                        select: "name slug"
                    },
                    {
                        path: "brand",
                        select: "name slug logo"
                    }
                ]
            }
        );

        if (!product) throw new NotFoundException("Product not found");
        return product;
    }

    async updateProduct(productId: string, body: UpdateProductDto, userId: string) {

        const product = await this.productRepository.findOneDocument({
            _id: productId,
            isDeleted: false
        });
        if (!product) throw new NotFoundException("Product not found");

        if (body.category) {
            const categoryExists = await this.categoryRepository.exists({
                _id: body.category,
                isDeleted: false
            });

            if (!categoryExists) throw new NotFoundException("Category not found");
        }

        if (body.brand) {

            const brandExists = await this.brandRepository.exists({
                _id: body.brand,
                isDeleted: false
            });
            if (!brandExists) throw new NotFoundException("Brand not found");

        }

        const updateData: any = {};

        if (body.title !== undefined) {
            updateData.title = body.title;
        }

        if (body.overview !== undefined) {
            updateData.overview = body.overview;
        }

        if (body.price !== undefined) {
            updateData.price = body.price;
        }

        if (body.discount !== undefined) {
            updateData.discount = body.discount;
        }

        if (body.stock !== undefined) {
            updateData.stock = body.stock;
        }

        if (body.category !== undefined) {
            updateData.category =
                new Types.ObjectId(body.category);
        }

        if (body.brand !== undefined) {
            updateData.brand =
                new Types.ObjectId(body.brand);
        }

        let uploadedFiles: UploadApiResponse[] = [];

        if (body.images !== undefined) {

            if (!body.images.length) throw new BadRequestException("At least one image is required");


            uploadedFiles = await this.cloudinaryService
                .uploadMultipleFiles(
                    body.images.map(image =>
                        Buffer.from(image, "base64")
                    ),
                    {
                        resource_type: "image"
                    }
                );

            updateData.images = uploadedFiles.map(file => ({
                secure_url: file.secure_url,
                public_id: file.public_id
            }));
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException(
                "No data provided for update"
            );
        }

        try {

            const updatedProduct = await this.productRepository.findByIdAndUpdate(
                productId,
                updateData
            );

            if (uploadedFiles.length && product.images?.length) {
                await this.cloudinaryService.deleteMultipleFiles(
                    product.images.map(
                        image => image.public_id
                    )
                );
            }
            return updatedProduct;

        } catch (error) {

            if (uploadedFiles.length) {

                await this.cloudinaryService.deleteMultipleFiles(
                    uploadedFiles.map(
                        file => file.public_id
                    )
                );
            }
            throw error;
        }
    }

    async deleteProduct(productId: string, userId: string) {

        const product = await this.productRepository.findOneDocument({
            _id: productId,
            isDeleted: false
        });
        if (!product) throw new NotFoundException("Product not found");

        return await this.productRepository.findByIdAndUpdate(
            productId,
            {
                isDeleted: true,
                isActive: false
            }
        );
    }
}