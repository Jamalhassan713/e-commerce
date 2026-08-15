import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Brand, BrandDocument } from "../model";


@Injectable()
export class BrandRepository extends BaseRepository<BrandDocument> {
    constructor(
        @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    ) {
        super(brandModel);
    }
}