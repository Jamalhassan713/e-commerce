import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Express } from "express";
import { Multer } from 'multer';
import { UserRepository } from "@/db";;
import { compareHash, encrypt, generateHash, getPagination, getPaginationMeta } from "@/utils";
import { changePasswordDto, updateProfileDto } from "./users.dto";
import { CloudinaryService } from "@/common";


@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly cloudinaryService: CloudinaryService
    ) { }
    async getProfile(userId: string) {
        const user = await this.userRepository.findOneDocument({ _id: userId }, '-password -otp -otpExpiresIn');
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
    async uploadProfilePicture(userId: string, file: Express.Multer.File) {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        if (!file) throw new BadRequestException('Profile picture is required');

        const uploadedImage = await this.cloudinaryService.uploadFile(file.buffer, {
            folder: 'users/profile-pictures',
            resource_type: 'image'
        });

        if (user.profilePicture?.public_id) {
            await this.cloudinaryService.deleteFile(user.profilePicture.public_id);
        }

        const updatedUser = await this.userRepository.findByIdAndUpdate(userId, {
            profilePicture: {
                secure_url: uploadedImage.secure_url,
                public_id: uploadedImage.public_id
            }
        });

        return updatedUser;
    }
    async updateProfile(userId: string, body: updateProfileDto, file?: Express.Multer.File) {

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const updateData: any = {};

        if (body.firstName !== undefined) updateData.firstName = body.firstName;

        if (body.lastName !== undefined) updateData.lastName = body.lastName;

        if (body.age !== undefined) updateData.age = body.age;

        if (body.gender !== undefined) updateData.gender = body.gender;

        if (body.phoneNumber !== undefined) updateData.phoneNumber = encrypt(body.phoneNumber);

        if (file) {
            const uploadedImage = await this.cloudinaryService.uploadFile(
                file.buffer,
                {
                    folder: 'users/profile-pictures', resource_type: 'image'
                }
            );
            if (user.profilePicture?.public_id) {
                await this.cloudinaryService.deleteFile(user.profilePicture.public_id);
            }
            updateData.profilePicture = {
                secure_url: uploadedImage.secure_url,
                public_id: uploadedImage.public_id
            };
        }
        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('No valid fields provided for update');
        }
        await this.userRepository.findByIdAndUpdate(
            userId,
            updateData
        );
    };

    async changePassword(userId: string, body: changePasswordDto) {
        const user = await this.userRepository.findOneDocument({ _id: userId }, '+password');
        if (!user) throw new NotFoundException('User not found');

        const { currentPassword, newPassword } = body;

        const isPasswordMatch = compareHash(currentPassword, user.password);
        if (!isPasswordMatch) throw new BadRequestException('Current password is incorrect');

        const isSamePassword = compareHash(newPassword, user.password);
        if (isSamePassword) throw new BadRequestException('New password must be different from current password');

        const hashedNewPassword = generateHash(newPassword);
        await this.userRepository.findByIdAndUpdate(userId, { password: hashedNewPassword });

        return { message: 'Password changed successfully' };
    }
    async deleteProfilePicture(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) throw new NotFoundException('User not found');

        if (!user.profilePicture?.public_id) {
            throw new BadRequestException('Profile picture not found');
        }

        await this.cloudinaryService.deleteFile(
            user.profilePicture.public_id
        );

        const updatedUser = await this.userRepository.findByIdAndUpdate(
            userId,
            {
                $unset: {
                    profilePicture: 1
                }
            }
        );

        return updatedUser;
    }

    async deleteAccount(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) throw new NotFoundException('User not found');

        if (user.profilePicture?.public_id) {
            await this.cloudinaryService.deleteFile(
                user.profilePicture.public_id
            );
        }

        await this.userRepository.deleteById(userId);

        return {
            message: 'Account deleted successfully'
        };
    }


}