import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Product, ProductDocument } from "../model";



@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    ) {
        super(productModel);
    }
   
}