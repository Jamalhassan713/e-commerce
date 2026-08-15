import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { User } from "./user.model";


@Schema({ timestamps: true })
export class Category {

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
        type: {
            secure_url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    })
    logo: {
        secure_url: string;
        public_id: string;
    };

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


export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index(
    { name: 1 },
    {
        unique: true,
        name: "idx_name_unique_active",
        partialFilterExpression: {
            isDeleted: false
        }
    }
);

CategorySchema.index(
    { slug: 1 },
    {
        unique: true,
        name: "idx_slug_unique_active",
        partialFilterExpression: {
            isDeleted: false
        }
    }
);

export const CategoryModel = MongooseModule.forFeatureAsync([
    {
        name: Category.name,

        useFactory: () => {

            const schema = CategorySchema;

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


export type CategoryDocument = HydratedDocument<Category>;