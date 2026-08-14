import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { NotificationType, Notification } from "../model";


@Injectable()
export class NotificationRepository extends BaseRepository<NotificationType> {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationType>
    ) {
        super(notificationModel)
    }
}