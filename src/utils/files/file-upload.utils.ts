import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export const imageUpload = (
    fieldName: string,
    maxSize = 5 * 1024 * 1024
) => {
    return FileInterceptor(fieldName, {
        limits: {
            fileSize: maxSize
        },

        fileFilter: (req, file, callback) => {

            if (!file.mimetype.startsWith('image/')) {
                return callback(
                    new BadRequestException(
                        'Only image files are allowed'
                    ),
                    false
                );
            }

            callback(null, true);
        }
    });
};
