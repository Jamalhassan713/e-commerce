import { Module } from "@nestjs/common";

import { BrandController } from "./brand.controller";
import { BrandService } from "./brand.service";

import { BrandRepository, BrandModel } from "@/db";

@Module({
    imports: [
        BrandModel
    ],
    controllers: [
        BrandController
    ],
    providers: [
        BrandService,
    ]
})
export class BrandModule {}