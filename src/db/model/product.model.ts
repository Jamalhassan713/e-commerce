import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";

import { User } from "./user.model";
import { Category } from "./category.model";
import { Brand } from "./brand.model";


@Schema({ timestamps: true })
export class Product {

    @Prop({
        type: String,
        trim: true,
        required: true
    })
    title: string;


    @Prop({
        type: String,
        trim: true,
        lowercase: true
    })
    slug: string;


    @Prop({
        type: String,
        trim: true,
        required: true
    })
    overview: string;


    @Prop({
        type: Number,
        min: [0, "Price cannot be negative"],
        required: true
    })
    price: number;


    @Prop({
        type: Number,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"],
        default: 0
    })
    discount: number;


    @Prop({
        type: Number,
        min: [0, "Final price cannot be negative"]
    })
    finalPrice: number;


    @Prop({
        type: Number,
        min: [0, "Stock cannot be negative"],
        default: 0
    })
    stock: number;


    @Prop({
        type: Number,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
        default: 0
    })
    rating: number;


    @Prop({
        type: [
            {
                secure_url: {
                    type: String,
                    required: true
                },
                public_id: {
                    type: String,
                    required: true
                }
            }
        ],
        default: []
    })
    images: {
        secure_url: string;
        public_id: string;
    }[];


    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true
    })
    createdBy: Types.ObjectId;


    @Prop({
        type: Types.ObjectId,
        ref: Category.name,
        required: true
    })
    category: Types.ObjectId;


    @Prop({
        type: Types.ObjectId,
        ref: Brand.name,
        required: true
    })
    brand: Types.ObjectId;


    @Prop({
        type: Boolean,
        default: true
    })
    isActive: boolean;


    @Prop({
        type: Boolean,
        default: false
    })
    isDeleted: boolean;
}


export const ProductSchema = SchemaFactory.createForClass(Product);


// Product filtering indexes

ProductSchema.index({
    category: 1
});

ProductSchema.index({
    brand: 1
});

ProductSchema.index({
    isActive: 1,
    isDeleted: 1
});

ProductSchema.index({
    category: 1,
    brand: 1
});


// Generate slug and calculate final price
ProductSchema.pre("save", function () {

    this.slug = slugify(this.title, {
        lower: true,
        trim: true,
        replacement: "-"
    });

    this.finalPrice =
        this.price - (this.price * (this.discount / 100));
});


// Update slug and final price
ProductSchema.pre("findOneAndUpdate", function () {

    const update: any = this.getUpdate();

    const title =
        update.title ??
        update.$set?.title;

    const price =
        update.price ??
        update.$set?.price;

    const discount =
        update.discount ??
        update.$set?.discount;


    // Update slug
    if (title) {

        const slug = slugify(title, {
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


    // Update final price
    if (price !== undefined || discount !== undefined) {

        const currentPrice =
            price ??
            update.$set?.price;

        const currentDiscount =
            discount ??
            update.$set?.discount;

        if (
            currentPrice !== undefined &&
            currentDiscount !== undefined
        ) {

            const finalPrice =
                currentPrice -
                (currentPrice * (currentDiscount / 100));


            if (update.$set) {
                update.$set.finalPrice = finalPrice;
            } else {
                update.finalPrice = finalPrice;
            }
        }
    }
    this.setUpdate(update);
});


export const ProductModel = MongooseModule.forFeatureAsync([
    {
        name: Product.name,
        useFactory: () => {
            return ProductSchema;
        }
    }
]);


export type ProductDocument = HydratedDocument<Product>;