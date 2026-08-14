import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/db';
import { encrypt } from '@/utils';
import { getUsersDto, updateUserDto, updateUserRoleDto, updateUserStatusDto } from './admin.dto';
import { notificationTypes } from '@/common';
import { NotificationService } from '@/common/services/notification.service';

@Injectable()
export class AdminService {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly notificationService: NotificationService
    ) { }


    async getUsers(query: getUsersDto) {

        const { page = 1, limit = 10 } = query;

        return await this.userRepository.paginateModel(
            {
                isDeleted: false
            },
            page,
            limit
        );
    }

    async getUserById(userId: string) {

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateUser(userId: string, body: updateUserDto) {

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');


        const updateData: any = {};

        if (body.firstName !== undefined) {
            updateData.firstName = body.firstName;
        }

        if (body.lastName !== undefined) {
            updateData.lastName = body.lastName;
        }

        if (body.age !== undefined) {
            updateData.age = body.age;
        }

        if (body.gender !== undefined) {
            updateData.gender = body.gender;
        }

        if (body.phoneNumber !== undefined) {
            updateData.phoneNumber = encrypt(
                body.phoneNumber
            );
        }

        if (body.email !== undefined) {

            const emailExists =
                await this.userRepository.exists({
                    email: body.email,
                    _id: {
                        $ne: userId
                    }
                });

            if (emailExists) {
                throw new ConflictException(
                    'Email already exists'
                );
            }

            updateData.email = body.email;
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException(
                'No data provided for update'
            );
        }

        return await this.userRepository.findByIdAndUpdate(
            userId,
            updateData
        );
    }

    async updateUserStatus(userId: string, body: updateUserStatusDto, adminId: string) {

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (user.isBlocked === body.isBlocked) {
            throw new BadRequestException(
                body.isBlocked
                    ? 'User is already blocked'
                    : 'User is already unblocked'
            );
        }
        const updatedUser = await this.userRepository.findByIdAndUpdate(
            userId,
            {
                isBlocked: body.isBlocked
            }
        );

        await this.notificationService.createNotification(
            userId,

            body.isBlocked
                ? 'Account Blocked'
                : 'Account Unblocked',

            body.isBlocked
                ? 'Your account has been blocked by an administrator.'
                : 'Your account has been unblocked by an administrator.',

            notificationTypes.SYSTEM,
            adminId
        );
        return updatedUser;
    }


    async updateUserRole(userId: string, body: updateUserRoleDto, adminId: string) {

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (user.role === body.role) {
            throw new BadRequestException('User already has this role');
        }


        const updatedUser = await this.userRepository.findByIdAndUpdate(
            userId,
            {
                role: body.role
            }
        );


        await this.notificationService.createNotification(
            userId,
            'Account Role Updated',
            `Your account role has been changed to ${body.role}.`,
            notificationTypes.SYSTEM,
            adminId
        );
        return updatedUser;
    }


    async deleteUser(userId: string) {

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found')
        if (user.isDeleted) {
            throw new BadRequestException('User is already deleted');
        }

        return await this.userRepository.findByIdAndUpdate(
            userId,
            {
                isDeleted: true
            }
        );
    }
}
