import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min
} from "class-validator";

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    overview: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @IsMongoId()
    @IsNotEmpty()
    category: string;

    @IsMongoId()
    @IsNotEmpty()
    brand: string;

    @IsOptional()
    @IsArray()
    images?: string[];
}

export class UpdateProductDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    overview?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsMongoId()
    category?: string;

    @IsOptional()
    @IsMongoId()
    brand?: string;

    @IsOptional()
    @IsArray()
    images?: string[];
}