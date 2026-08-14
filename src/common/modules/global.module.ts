import { BlackListTokenModel, BlackListTokenRepository, NotificationModel, NotificationRepository, UserModel, UserRepository } from "@/db";
import { Global, Module } from "@nestjs/common";
import { CloudinaryService, NotificationService, SocketService, TokenService } from "../services";
import { JwtService } from "@nestjs/jwt";



@Global()
@Module({
    imports: [UserModel, BlackListTokenModel, NotificationModel],
    providers: [UserRepository, BlackListTokenRepository, TokenService, JwtService, CloudinaryService, SocketService, NotificationService, NotificationRepository],
    exports: [UserRepository, BlackListTokenRepository, TokenService, JwtService, CloudinaryService, SocketService, NotificationService, NotificationRepository]
})
export class GlobalModule { }
