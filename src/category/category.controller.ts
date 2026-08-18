import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Auth, AuthUser } from "@/common/decorators/custom.decorator";
import { systemRoles } from "@/common";
import { UserType } from "@/db";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";
import { CategoryService } from "./category.service";

@Controller("categories")
export class CategoryController {

    constructor(
        private readonly categoryService: CategoryService
    ) { }

    @Post()
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async addCategory(
        @Body() body: CreateCategoryDto,
        @AuthUser() user: Partial<UserType>
    ) {

        return {
            message: "Category created successfully",
            data: await this.categoryService.addCategory(body, user._id!.toString())
        };
    }

    @Get()
    async getCategories(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10
    ) {
        return await this.categoryService.getCategories(
            page,
            limit
        );
    }

    @Get(":categoryId")
    async getCategoryById(
        @Param("categoryId") categoryId: string
    ) {

        return await this.categoryService.getCategoryById(
            categoryId
        );
    }

    @Patch(":categoryId")
    @Auth([
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async updateCategory(
        @Param("categoryId") categoryId: string,
        @Body() body: UpdateCategoryDto,
        @AuthUser() user: Partial<UserType>
    ) {

        return {
            message: "Category updated successfully",
            data:
                await this.categoryService.updateCategory(
                    categoryId,
                    body,
                    user._id!.toString()
                )
        };
    }
    @Delete(":categoryId")
    @Auth([
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async deleteCategory(
        @Param("categoryId") categoryId: string,
        @AuthUser() user: Partial<UserType>
    ) {

        return {
            message: "Category deleted successfully",
            data:
                await this.categoryService.deleteCategory(
                    categoryId,
                    user._id!.toString()
                )
        };
    }
}