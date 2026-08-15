import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class createBrandDto {

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @IsOptional()
    @IsString()
    logo?: string;
}

export class updateBrandDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsString()
    logo?: string;
}