import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { getUsersDto, updateUserDto, updateUserRoleDto, updateUserStatusDto } from './admin.dto';
import { Auth, AuthUser, systemRoles } from '@/common';
import { UserType } from '@/db';


@Controller('admin')
export class AdminController {

    constructor(
        private readonly adminService: AdminService
    ) { }


    @Get('users')
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async getUsers(
        @Query() query: getUsersDto
    ) {
        return {
            message: 'Users fetched successfully',
            data: await this.adminService.getUsers(query)
        };
    }

    @Get('users/:userId')
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async getUserById(
        @Param('userId') userId: string
    ) {
        return {
            message: 'User fetched successfully',
            data: await this.adminService.getUserById(userId)
        };
    }


    @Patch('users/:userId')
    @Auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN])
    async updateUser(
        @Param('userId') userId: string,
        @Body() body: updateUserDto
    ) {
        return {
            message: 'User updated successfully',
            data: await this.adminService.updateUser(
                userId,
                body
            )
        };
    }


    @Patch('users/:userId/status')
    @Auth([
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ])
    async updateUserStatus(
        @Param('userId') userId: string,
        @Body() body: updateUserStatusDto,
        @AuthUser() admin: Partial<UserType>
    ) {

        return {
            message: body.isBlocked
                ? 'User blocked successfully'
                : 'User unblocked successfully',

            data: await this.adminService.updateUserStatus(
                userId,
                body,
                admin._id!.toString()
            )
        };
    }


    @Patch('users/:userId/role')
    @Auth([
        systemRoles.SUPER_ADMIN
    ])
    async updateUserRole(
        @Param('userId') userId: string,
        @Body() body: updateUserRoleDto,
        @AuthUser() admin: Partial<UserType>
    ) {

        return {
            message: 'User role updated successfully',

            data: await this.adminService.updateUserRole(
                userId,
                body,
                admin._id!.toString()
            )
        };
    }


    @Delete('users/:userId')
    @Auth([
        systemRoles.SUPER_ADMIN
    ])
    async deleteUser(
        @Param('userId') userId: string
    ) {

        return {
            message: 'User deleted successfully',
            data: await this.adminService.deleteUser(
                userId
            )
        };
    }
}
