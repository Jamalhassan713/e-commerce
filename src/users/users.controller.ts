import { Body, Controller, Delete, Get, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UserService } from "./users.service";
import { Auth, AuthUser } from "@/common/decorators/custom.decorator";
import { UserType } from "@/db";
import { systemRoles } from "@/common";
import { changePasswordDto, updateProfileDto } from "./users.dto";
import { imageUpload } from "@/utils";


@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    @Auth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async getProfile(
        @AuthUser() user: Partial<UserType>
    ) {
        return await this.userService.getProfile(user._id!.toString());
    }

    @Post('upload-profile-picture')
    @Auth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    @UseInterceptors(imageUpload('profilePicture'))
    async uploadProfilePicture(
        @AuthUser() user: Partial<UserType>,
        @UploadedFile() file: Express.Multer.File
    ) {
        return {
            message: "Profile picture uploaded successfully",
            data: await this.userService.uploadProfilePicture(user._id!.toString(), file)
        }
    }

    @Put('update-profile')
    @Auth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async updateProfile(
        @AuthUser() user: Partial<UserType>,
        @Body() body: updateProfileDto
    ) {
        return {
            message: "Profile updated successfully",
            data: await this.userService.updateProfile(user._id!.toString(), body)
        }
    }

    @Patch('change-password')
    @Auth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async changePassword(
        @AuthUser() user: Partial<UserType>,
        @Body() body: changePasswordDto
    ) {
        return {
            message: "Password changed successfully",
            data: await this.userService.changePassword(user._id!.toString(), body)
        }
    }

    @Delete('profile-picture')
    @Auth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async deleteProfilePicture(
        @AuthUser() user: Partial<UserType>
    ) {
        return {
            message: "Profile picture deleted successfully",
            data: await this.userService.deleteProfilePicture(user._id!.toString())
        }
    }

    @Delete('account')
    @Auth([systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async deleteAccount(
        @AuthUser() user: Partial<UserType>
    ) {
        return {
            data: await this.userService.deleteAccount(user._id!.toString())
        }
    }

    
}