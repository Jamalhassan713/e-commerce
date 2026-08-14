
import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { genders, roles } from '@/common';


@Schema({ timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } })
export class User {
    @Prop({ trim: true, required: [true, 'First name is required'] })
    firstName: string;

    @Prop({ trim: true, required: [true, 'Last name is required'] })
    lastName: string;

    @Prop({ unique: true, required: [true, 'Email is required'], trim: true })
    email: string;

    @Prop({ select: false, required: [true, 'Password is required'] })
    password: string;

    @Prop({ default: roles.USER, enum: roles })
    role: string;

    @Prop({ min: [10, 'Age must be at least 10 years old'], required: [true, 'Age is required'] })
    age: number;

    @Prop({ enum: genders, required: [true, 'Gender is required'] })
    gender: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: false })
    isBlocked: boolean;

    @Prop({ trim: true })
    phoneNumber: string;

    @Prop({ select: false })
    otp: string;

    @Prop()
    otpExpiresIn: Date;

    @Prop({
        type: {
            secure_url: String,
            public_id: String
        }
    })
    profilePicture: {
        secure_url: string;
        public_id: string;
    };

    @Virtual({
        get: function (this: User) {
            return this.firstName + ' ' + this.lastName;
        },
    })
    fullName: string;
}

//schema
export const UserSchema = SchemaFactory.createForClass(User)

//model
export const UserModel = MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
]);

//type
export type UserType = HydratedDocument<User>
