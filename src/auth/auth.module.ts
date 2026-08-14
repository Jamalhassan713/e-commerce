import { Module } from '@nestjs/common';
import { BlackListTokenModel, BlackListTokenRepository } from '@/db' ;
import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { AuthListener } from './listeners/auth.listener';
import { EmailService } from '@/common';


@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService,AuthListener,EmailService],
})
export class AuthModule { }
