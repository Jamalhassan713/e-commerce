import { genders } from "@/common";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, MinLength, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({ name: 'confirmPassword', async: false })
class ConfirmPassword implements ValidatorConstraintInterface {
    validate(confirmPassword: string, args: ValidationArguments) {
        const obj = args.object as any;
        return confirmPassword === obj.password;
    }
    defaultMessage(): string {
        return 'password do not match'
    }
}

export class registerDto {
    @IsString({ message: "First name must be a string" })
    @IsNotEmpty({ message: "First name is required" })
    firstName: string;

    @IsString({ message: "Last name must be a string" })
    @IsNotEmpty({ message: "Last name is required" })
    lastName: string;

    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    password: string;

    @Validate(ConfirmPassword, { message: "Passwords do not match" })
    confirmPassword: string;

    @IsNumber({}, { message: "Age must be a number" })
    age: number;

    @IsEnum(genders, { message: "Gender must be male or female" })
    gender: genders;

    @IsString({ message: "Phone number must be a string" })
    @IsNotEmpty({ message: "Phone number is required" })
    @IsPhoneNumber(undefined, { message: "Invalid phone number format" })
    phoneNumber: string;

}

export class confirmEmailDto {
    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString({ message: "OTP must be a string" })
    @IsNotEmpty({ message: "OTP is required" })
    otp: string;
}
export class SendOtpAgainDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
export class loginDto {
    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    password: string;
}

export class refreshTokenDto {
    @IsString({ message: "Refresh token must be a string" })
    @IsNotEmpty({ message: "Refresh token is required" })
    refreshToken: string;
}

export class forgotPasswordDto {
    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;
}

export class resetPasswordDto {
    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString({ message: "OTP must be a string" })
    @IsNotEmpty({ message: "OTP is required" })
    otp: string;

    @IsString({ message: "New password must be a string" })
    @IsNotEmpty({ message: "New password is required" })
    @MinLength(6, { message: "New password must be at least 6 characters long" })
    newPassword: string;
}

