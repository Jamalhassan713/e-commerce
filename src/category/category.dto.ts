import {
    IsBase64,
    IsNotEmpty,
    IsOptional,
    IsString
} from "class-validator";

export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    logo: string;
}

export class UpdateCategoryDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    logo?: string;
}