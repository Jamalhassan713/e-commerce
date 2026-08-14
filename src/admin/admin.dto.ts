import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { genders, roles } from '@/common';


export class getUsersDto {

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 10;
}

export class updateUserDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    firstName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    @Min(10)
    age?: number;

    @IsOptional()
    @IsEnum(genders)
    gender?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

export class updateUserStatusDto {

    @IsBoolean()
    isBlocked: boolean;
}
export class updateUserRoleDto {

    @IsEnum(roles)
    role: string;
}
