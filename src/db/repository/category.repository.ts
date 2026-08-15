import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Category, CategoryDocument } from "../model";






@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    ) {
        super(categoryModel);
    }
}