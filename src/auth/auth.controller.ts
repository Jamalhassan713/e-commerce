import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Auth, AuthUser } from "@/common/decorators/custom.decorator";
import { UserType } from "@/db";
import { systemRoles } from "@/common";
import { AuthService } from "@/auth/auth.service";
import { confirmEmailDto, loginDto, refreshTokenDto, registerDto, SendOtpAgainDto } from "./auth.dto";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body() body: registerDto
    ) {
        return {
            message: "User registered successfully",
            data: await this.authService.register(body)
        };
    };

    @Post('confirm-email')
    async confirmEmail(
        @Body() body: confirmEmailDto
    ) {
        return await this.authService.confirmEmail(body);
    }
    @Post('send-otp-again')
    async sendOtpAgain(
        @Body() body: SendOtpAgainDto
    ) {
        return await this.authService.sendOtpAgain(body);
    }

    @Post('login')
    async login(
        @Body() Body: loginDto
    ) {
        return await this.authService.login(Body);
    }

    @Get('profile')
    @Auth([systemRoles.USER])
    profile(
        @AuthUser() user: Partial<UserType>
    ) {
        return user;
    }

    @Post('refresh-token')
    async refreshToken(
        @Body() body: refreshTokenDto
    ) {
        return await this.authService.refreshToken(body);
    }

    @Post('logout')
    @Auth([])
    async logOut(
        @Req() request: any
    ) {
        return await this.authService.logOut(request);
    }

    @Post('forgot-password')
    @Auth([systemRoles.USER])
    async forgotPassword(
        @Body() forgotPasswordDto: { email: string }
    ) {
        return await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @Auth([systemRoles.USER])
    async resetPassword(
        @Body() resetPasswordDto: { email: string, otp: string, newPassword: string }
    ) {
        return await this.authService.resetPassword(resetPasswordDto);
    }
}