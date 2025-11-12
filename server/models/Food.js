import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide food name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide food description'],
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide price'],
            min: [0, 'Price cannot be negative'],
        },
        originalPrice: {
            type: Number,
            min: [0, 'Original price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please provide category'],
            enum: [
                'Pizza',
                'Burger',
                'Shawarma',
                'Momo',
                'Chicken Fry',
                'Sandwich',
                'Dessert',
                'Drinks',
                'Coffee',
                'Juice',
                'Waffle',
                'Pasta',
                'Rice',
                'Others',
            ],
        },
        image: {
            type: String,
            required: [true, 'Please provide food image'],
        },
        imagePublicId: {
            type: String,
        },
        images: [
            {
                url: String,
                publicId: String,
            },
        ],
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },
        isVegetarian: {
            type: Boolean,
            default: false,
        },
        isSpicy: {
            type: Boolean,
            default: false,
        },
        ingredients: [
            {
                type: String,
                trim: true,
            },
        ],
        allergens: [
            {
                type: String,
                trim: true,
            },
        ],
        nutritionInfo: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
        },
        preparationTime: {
            type: Number, // in minutes
            default: 15,
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be negative'],
            max: [5, 'Rating cannot exceed 5'],
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        soldCount: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            default: null, // null means unlimited
            min: [0, 'Stock cannot be negative'],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        sizes: [
            {
                name: {
                    type: String,
                    enum: ['Small', 'Medium', 'Large', 'Extra Large'],
                },
                price: Number,
            },
        ],
        addOns: [
            {
                name: String,
                price: Number,
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
foodSchema.index({ name: 'text', description: 'text' }); // Text search
foodSchema.index({ category: 1 });
foodSchema.index({ isAvailable: 1 });
foodSchema.index({ isFeatured: 1 });
foodSchema.index({ isPopular: 1 });
foodSchema.index({ isNewArrival: 1 });
foodSchema.index({ price: 1 });
foodSchema.index({ rating: -1 });
foodSchema.index({ soldCount: -1 });
foodSchema.index({ createdAt: -1 });

// Virtual for reviews
foodSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'food',
});

// Calculate discount price
foodSchema.virtual('discountPrice').get(function () {
    if (this.discount > 0) {
        return this.price - (this.price * this.discount) / 100;
    }
    return this.price;
});

// Check if in stock
foodSchema.methods.isInStock = function () {
    if (this.stock === null) return true; // Unlimited stock
    return this.stock > 0;
};

// Decrease stock
foodSchema.methods.decreaseStock = async function (quantity) {
    if (this.stock !== null) {
        this.stock -= quantity;
        if (this.stock < 0) this.stock = 0;
        await this.save();
    }
};

// Increase sold count
foodSchema.methods.increaseSoldCount = async function (quantity) {
    this.soldCount += quantity;
    await this.save();
};

export default mongoose.model('Food', foodSchema);