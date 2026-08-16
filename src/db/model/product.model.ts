import {
    MongooseModule,
    Prop,
    Schema,
    SchemaFactory
} from "@nestjs/mongoose";

import {
    HydratedDocument,
    Types
} from "mongoose";

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


    /*
     * Rating is not controlled by the user.
     *
     * It will be calculated later from Reviews.
     */
    @Prop({
        type: Number,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
        default: 0
    })
    rating: number;


    /*
     * Cloudinary Images
     *
     * We store both:
     * - secure_url → image URL
     * - public_id  → used to delete/replace the image
     */
    @Prop({
        type: [
            {
                secure_url: {
                    type: String,
                    required: true,
                    trim: true
                },

                public_id: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],

        default: []
    })
    images: {
        secure_url: string;
        public_id: string;
    }[];


    /*
     * Product Owner
     */
    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true
    })
    createdBy: Types.ObjectId;


    /*
     * Product Category
     */
    @Prop({
        type: Types.ObjectId,
        ref: Category.name,
        required: true
    })
    category: Types.ObjectId;


    /*
     * Product Brand
     */
    @Prop({
        type: Types.ObjectId,
        ref: Brand.name,
        required: true
    })
    brand: Types.ObjectId;


    /*
     * Product status
     */
    @Prop({
        type: Boolean,
        default: true
    })
    isActive: boolean;


    /*
     * Soft delete
     */
    @Prop({
        type: Boolean,
        default: false
    })
    isDeleted: boolean;
}


export const ProductSchema =
    SchemaFactory.createForClass(Product);


/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/


// Filter products by category
ProductSchema.index({
    category: 1
});


// Filter products by brand
ProductSchema.index({
    brand: 1
});


// Filter active / deleted products
ProductSchema.index({
    isActive: 1,
    isDeleted: 1
});


// Filter products by category + brand
ProductSchema.index({
    category: 1,
    brand: 1
});


/*
|--------------------------------------------------------------------------
| Pre Save
|--------------------------------------------------------------------------
|
| Generate slug
| Calculate final price
|
*/

ProductSchema.pre("save", function () {

    this.slug = slugify(this.title, {
        lower: true,
        trim: true,
        replacement: "-"
    });


    this.finalPrice =
        this.price -
        (this.price * (this.discount / 100));

});


/*
|--------------------------------------------------------------------------
| Pre FindOneAndUpdate
|--------------------------------------------------------------------------
|
| Handle:
| - title → slug
| - price / discount → finalPrice
|
*/

ProductSchema.pre(
    "findOneAndUpdate",
    async function () {

        const update: any = this.getUpdate();

        update.$set = update.$set || {};


        /*
         * Update slug
         */

        const title =
            update.$set.title ??
            update.title;

        if (title !== undefined) {

            update.$set.slug =
                slugify(title, {
                    lower: true,
                    trim: true,
                    replacement: "-"
                });

        }


        /*
         * Get price / discount from update
         */

        const price =
            update.$set.price ??
            update.price;

        const discount =
            update.$set.discount ??
            update.discount;


        /*
         * Recalculate finalPrice
         */

        if (
            price !== undefined ||
            discount !== undefined
        ) {

            const currentDocument =
                await this.model
                    .findOne(this.getQuery())
                    .select("price discount")
                    .lean()
                    .exec() as {
                        price: number;
                        discount: number;
                    } | null;


            if (currentDocument) {

                const currentPrice =
                    price ??
                    currentDocument.price;

                const currentDiscount =
                    discount ??
                    currentDocument.discount;


                update.$set.finalPrice =
                    currentPrice -
                    (
                        currentPrice *
                        (currentDiscount / 100)
                    );

            }
        }


        this.setUpdate(update);
    }
);

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

export const ProductModel =
    MongooseModule.forFeatureAsync([

        {
            name: Product.name,

            useFactory: () => {

                return ProductSchema;

            }
        }

    ]);


/*
|--------------------------------------------------------------------------
| Document Type
|--------------------------------------------------------------------------
*/

export type ProductDocument =
    HydratedDocument<Product>;