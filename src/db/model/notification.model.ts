import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.model';
import { notificationTypes } from '@/common';

@Schema({
    timestamps: true
})
export class Notification {

    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: [true, 'Recipient is required'],
        index: true
    })
    recipientId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: false
    })
    senderId?: Types.ObjectId;

    @Prop({
        required: [true, 'Title is required'],
        trim: true
    })
    title: string;

    @Prop({
        required: [true, 'Message is required'],
        trim: true
    })
    message: string;

    @Prop({
        required: [true, 'Notification type is required'],
        enum: notificationTypes
    })
    type: string;

    @Prop({
        default: false
    })
    isRead: boolean;
}


// schema
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// model
export const NotificationModel =
    MongooseModule.forFeature([
        {
            name: Notification.name,
            schema: NotificationSchema
        }
    ]);

// type
export type NotificationType = HydratedDocument<Notification>;
