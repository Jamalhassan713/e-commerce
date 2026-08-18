import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Auth, AuthUser } from "@/common/decorators/custom.decorator";
import { systemRoles } from "@/common";
import { UserType } from "@/db";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {

  constructor(
    private readonly productService: ProductService
  ) { }

  @Post("add")
  @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
  async addProduct(
    @Body() body: CreateProductDto,
    @AuthUser() user: Partial<UserType>
  ) {
    return {
      message: "Product created successfully",
      data: await this.productService.addProduct(
        body,
        user._id!.toString()
      )
    };
  }

  @Get("get")
  async getProducts(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return await this.productService.getProducts(
      page,
      limit
    );
  }
  @Get(":productId")
  async getProductById(
    @Param("productId") productId: string
  ) {
    return await this.productService.getProductById(
      productId
    );
  }

  @Patch(":productId")
  @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
  async updateProduct(
    @Param("productId") productId: string,
    @Body() body: UpdateProductDto,
    @AuthUser() user: Partial<UserType>
  ) {

    return {
      message: "Product updated successfully",
      data: await this.productService.updateProduct(
        productId,
        body,
        user._id!.toString()
      )
    };
  }

  @Delete(":productId")
  @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
  async deleteProduct(
    @Param("productId") productId: string,
    @AuthUser() user: Partial<UserType>
  ) {

    return {
      message: "Product deleted successfully",
      data: await this.productService.deleteProduct(
        productId,
        user._id!.toString()
      )
    };
  }
}