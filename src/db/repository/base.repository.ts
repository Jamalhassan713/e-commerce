import { Injectable } from "@nestjs/common";
import { DeleteResult, FilterQuery, Model, PopulateOptions, ProjectionType, QueryOptions, Types, UpdateQuery, UpdateResult } from "mongoose";
import { getPagination, getPaginationMeta } from "@/utils";

@Injectable()
export abstract class BaseRepository<T> {

    constructor(protected readonly model: Model<T>) { }

    async createDocument(document: Partial<T>): Promise<T> {
        return await this.model.create(document);
    }

    async insertMany(documents: Partial<T>[]): Promise<T[]> {
        return await this.model.insertMany(documents) as T[];
    }

    async findOneDocument(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T> & { populate?: PopulateOptions | PopulateOptions[] }): Promise<T | null> {
        const query = this.model.findOne(filter, projection, options);
        if (options?.populate) query.populate(options.populate);
        return await query;
    }

    async findAllDocument(filter: FilterQuery<T> = {}, projection?: ProjectionType<T>, options?: QueryOptions<T> & { populate?: PopulateOptions | PopulateOptions[] }): Promise<T[]> {
        const query = this.model.find(filter, projection, options);
        if (options?.populate) query.populate(options.populate);
        return await query;
    }

    async findById(id: string | Types.ObjectId, projection?: ProjectionType<T>, options?: QueryOptions<T> & { populate?: PopulateOptions | PopulateOptions[] }): Promise<T | null> {
        const query = this.model.findById(id, projection, options);
        if (options?.populate) query.populate(options.populate);
        return await query;
    }

    async updateDocument(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
        return await this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options });
    }

    async findByIdAndUpdate(id: string | Types.ObjectId, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true, ...options });
    }

    async findByIdAndDelete(id: string | Types.ObjectId, options?: QueryOptions<T>): Promise<T | null> {
        return await this.model.findByIdAndDelete(id, options);
    }

    async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
        return await this.model.updateMany(filter, update);
    }

    async deleteDocument(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
        return await this.model.findOneAndDelete(filter, options);
    }

    async deleteById(id: string | Types.ObjectId): Promise<T | null> {
        return await this.model.findByIdAndDelete(id);
    }

    async deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }

    async exists(filter: FilterQuery<T>): Promise<boolean> {
        const result = await this.model.exists(filter);
        return !!result;
    }

    async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
        return await this.model.countDocuments(filter);
    }

    async paginateModel(
        filter: FilterQuery<T> = {},
        page: number = 1, limit: number = 10,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>
            & { populate?: PopulateOptions | PopulateOptions[] })
        : Promise<{
            data: T[]; pagination:
            {
                page: number;
                limit: number;
                totalItems: number;
                totalPages: number;
                hasNextPage: boolean;
                hasPreviousPage: boolean
            }
        }> {

        const { page: currentPage, limit: currentLimit, skip } = getPagination(page, limit);

        const query = this.model.find(filter, projection, options).skip(skip).limit(currentLimit);

        if (options?.populate) query.populate(options.populate);

        const [data, totalItems] = await Promise.all([
            query,
            this.model.countDocuments(filter)
        ]);

        return {
            data,
            pagination: getPaginationMeta(totalItems, currentPage, currentLimit)
        };
    }
}