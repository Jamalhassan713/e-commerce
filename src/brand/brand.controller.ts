import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Auth, AuthUser } from "@/common/decorators/custom.decorator";
import { systemRoles } from "@/common";
import { UserType } from "@/db";
import { createBrandDto, updateBrandDto } from "./brand.dto";
import { BrandService } from "./brand.service";

@Controller("brands")
export class BrandController {

    constructor(
        private readonly brandService: BrandService
    ) { }

    @Post("add")
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
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

    @Get("get")
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
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
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

    @Delete(":brandId")
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
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