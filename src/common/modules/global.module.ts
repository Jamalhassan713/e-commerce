import { BlackListTokenModel, BlackListTokenRepository, BrandModel, BrandRepository, CategoryModel, CategoryRepository, NotificationModel, NotificationRepository, ProductModel, ProductRepository, UserModel, UserRepository } from "@/db";
import { Global, Module } from "@nestjs/common";
import { CloudinaryService, NotificationService, SocketService, TokenService } from "../services";
import { JwtService } from "@nestjs/jwt";



@Global()
@Module({
    imports: [UserModel, BlackListTokenModel, NotificationModel, BrandModel, CategoryModel, ProductModel],
    providers: [UserRepository, BlackListTokenRepository, TokenService, JwtService, CloudinaryService, SocketService, NotificationService, NotificationRepository, BrandRepository, CategoryRepository, ProductRepository],
    exports: [UserRepository, BlackListTokenRepository, TokenService, JwtService, CloudinaryService, SocketService, NotificationService, NotificationRepository, BrandRepository, CategoryRepository, ProductRepository]
})
export class GlobalModule { }
