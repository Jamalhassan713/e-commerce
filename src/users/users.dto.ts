import { genders } from "@/common";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Min, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'confirmPassword', async: false })
class ConfirmPassword implements ValidatorConstraintInterface {

    validate(confirmPassword: string, args: ValidationArguments) {
        const obj = args.object as any;
        return confirmPassword === obj.newPassword;
    }

    defaultMessage(): string {
        return 'Passwords do not match';
    }
}

export class updateProfileDto {

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsNumber()
    age?: number;

    @IsOptional()
    @IsEnum(genders)
    gender?: string;

    @IsOptional()
    @IsString({ message: "Phone number must be a string" })
    @IsNotEmpty({ message: "Phone number is required" })
    @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
    phoneNumber?: string;
}

export class changePasswordDto {

    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    @Validate(ConfirmPassword)
    confirmPassword: string;
}


