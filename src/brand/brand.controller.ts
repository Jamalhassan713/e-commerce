import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query
} from "@nestjs/common";

import { BrandService } from "./brand.service";
import { createBrandDto, updateBrandDto } from "./brand.dto";

import {
    Auth,
    AuthUser,
    systemRoles
} from "@/common";

import { UserType } from "@/db";

@Controller("brands")
export class BrandController {

    constructor(
        private readonly brandService: BrandService
    ) {}

    @Post()
    @Auth([
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async createBrand(
        @Body() body: createBrandDto,
        @AuthUser() user: Partial<UserType>
    ) {

        return await this.brandService.createBrand(
            body,
            user._id!.toString()
        );
    }

    @Get()
    async getBrands(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10
    ) {

        return await this.brandService.getBrands(
            page,
            limit
        );
    }

    @Get(":brandId")
    async getBrandById(
        @Param("brandId") brandId: string
    ) {

        return await this.brandService.getBrandById(
            brandId
        );
    }

    @Patch(":brandId")
    @Auth([
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async updateBrand(
        @Param("brandId") brandId: string,
        @Body() body: updateBrandDto
    ) {

        return await this.brandService.updateBrand(
            brandId,
            body
        );
    }

    @Delete(":brandId")
    @Auth([
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async deleteBrand(
        @Param("brandId") brandId: string
    ) {

        return await this.brandService.deleteBrand(
            brandId
        );
    }
}