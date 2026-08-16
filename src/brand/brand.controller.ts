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

import {
    Auth,
    AuthUser
} from "@/common/decorators/custom.decorator";

import {
    systemRoles
} from "@/common";

import {
    UserType
} from "@/db";

import {
    createBrandDto,
    updateBrandDto
} from "./brand.dto";

import {
    BrandService
} from "./brand.service";


@Controller("brands")
export class BrandController {

    constructor(
        private readonly brandService: BrandService
    ) {}


    // Create Brand
    @Post()
    @Auth([
        systemRoles.USER,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async addBrand(
        @Body() body: createBrandDto,
        @AuthUser() user: Partial<UserType>
    ) {

        return {
            message: "Brand created successfully",

            data: await this.brandService.addBrand(
                body,
                user._id!.toString()
            )
        };
    }


    // Get All Brands
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


    // Get Brand By ID
    @Get(":brandId")
    async getBrandById(
        @Param("brandId") brandId: string
    ) {

        return await this.brandService.getBrandById(
            brandId
        );
    }


    // Update Brand
    @Patch(":brandId")
    @Auth([
        systemRoles.USER,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async updateBrand(
        @Param("brandId") brandId: string,
        @Body() body: updateBrandDto,
        @AuthUser() user: Partial<UserType>
    ) {

        return {
            message: "Brand updated successfully",

            data: await this.brandService.updateBrand(
                brandId,
                body,
                user._id!.toString()
            )
        };
    }


    // Delete Brand
    @Delete(":brandId")
    @Auth([
        systemRoles.USER,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async deleteBrand(
        @Param("brandId") brandId: string,
        @AuthUser() user: Partial<UserType>
    ) {

        return {
            message: "Brand deleted successfully",

            data: await this.brandService.deleteBrand(
                brandId,
                user._id!.toString()
            )
        };
    }
}