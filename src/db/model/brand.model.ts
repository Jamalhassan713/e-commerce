import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { User } from "./user.model";


@Schema({ _id: false })
export class CloudinaryImage {

    @Prop({
        type: String,
        required: true,
        trim: true
    })
    secure_url: string;

    @Prop({
        type: String,
        required: true,
        trim: true
    })
    public_id: string;
}


export const CloudinaryImageSchema =
    SchemaFactory.createForClass(CloudinaryImage);


@Schema({ timestamps: true })
export class Brand {

    @Prop({
        type: String,
        trim: true,
        required: true
    })
    name: string;


    @Prop({
        type: String,
        trim: true,
        lowercase: true
    })
    slug: string;


    @Prop({
        type: CloudinaryImageSchema,
        required: true
    })
    logo: CloudinaryImage;


    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true
    })
    createdBy: Types.ObjectId;


    @Prop({
        type: Boolean,
        default: false
    })
    isDeleted: boolean;
}


export const BrandSchema = SchemaFactory.createForClass(Brand);


BrandSchema.index(
    { name: 1 },
    {
        unique: true,
        name: "idx_name_unique_active",
        partialFilterExpression: {
            isDeleted: false
        }
    }
);


BrandSchema.index(
    { slug: 1 },
    {
        unique: true,
        name: "idx_slug_unique_active",
        partialFilterExpression: {
            isDeleted: false
        }
    }
);


export const BrandModel = MongooseModule.forFeatureAsync([
    {
        name: Brand.name,

        useFactory: () => {

            const schema = BrandSchema;

            schema.pre("save", function () {

                this.slug = slugify(this.name, {
                    lower: true,
                    trim: true,
                    replacement: "-"
                });

            });


            schema.pre("findOneAndUpdate", function () {

                const update: any = this.getUpdate();

                const name = update.name ?? update.$set?.name;


                if (name) {

                    const slug = slugify(name, {
                        lower: true,
                        trim: true,
                        replacement: "-"
                    });


                    if (update.$set) {

                        update.$set.slug = slug;

                    } else {

                        update.slug = slug;

                    }

                }

                this.setUpdate(update);

            });

            return schema;
        }
    }
]);


export type BrandDocument = HydratedDocument<Brand>;