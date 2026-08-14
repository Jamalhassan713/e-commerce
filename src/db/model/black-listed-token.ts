import { TokenTypes } from '@/common';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';



@Schema({
    timestamps: true
})
export class BlackListToken {

    @Prop({
        required: [true, 'Token is required'],
        unique: true
    })
    token: string;

    @Prop({
        required: [true, 'Token type is required'],
        enum: TokenTypes
    })
    tokenType: string;

    @Prop({
        required: [true, 'Expiration date is required'],
        expires: 0
    })
    expiresAt: Date;
}

// schema
export const BlackListTokenSchema = SchemaFactory.createForClass(BlackListToken);

// model
export const BlackListTokenModel =
    MongooseModule.forFeature([
        { name: BlackListToken.name, schema: BlackListTokenSchema }
    ]);

// type
export type BlackListTokenType = HydratedDocument<BlackListToken>;