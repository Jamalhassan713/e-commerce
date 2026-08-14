import { Injectable } from "@nestjs/common";
import { NotificationRepository } from "@/db";
import { SocketService } from "./socket.service";
import { Types } from "mongoose";

@Injectable()
export class NotificationService {

    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly socketService: SocketService
    ) { }

    async createNotification(
        recipientId: string,
        title: string,
        message: string,
        type: string,
        senderId?: string
    ) {

        const notification = await this.notificationRepository.createDocument({
            recipientId: new Types.ObjectId(recipientId),
            ...(senderId && { senderId: new Types.ObjectId(senderId) }),
            title,
            message,
            type
        });

        this.socketService.emitToUser(
            recipientId,
            "notification",
            notification
        );

        return notification;
    }
}
