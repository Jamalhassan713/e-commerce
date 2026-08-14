import { Module } from '@nestjs/common';
import { UserModel, UserRepository } from '@/db' ;
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { TokenService } from '@/common';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UserService],
})
export class UsersModule { }
