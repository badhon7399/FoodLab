import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please provide a promo code'],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, 'Code must be at least 3 characters'],
            maxlength: [20, 'Code cannot exceed 20 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: [true, 'Please provide discount value'],
            min: [0, 'Discount value cannot be negative'],
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: [0, 'Minimum order amount cannot be negative'],
        },
        maxDiscount: {
            type: Number,
            min: [0, 'Maximum discount cannot be negative'],
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
        },
        usageLimit: {
            type: Number,
            min: [0, 'Usage limit cannot be negative'],
        },
        usagePerUser: {
            type: Number,
            default: 1,
            min: [1, 'Usage per user must be at least 1'],
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usedBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                usageCount: {
                    type: Number,
                    default: 0,
                },
                lastUsed: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        applicableCategories: [
            {
                type: String,
            },
        ],
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Food',
            },
        ],
        excludedProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Food',
            },
        ],
        firstOrderOnly: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
promoCodeSchema.index({ isActive: 1 });
promoCodeSchema.index({ validFrom: 1, validUntil: 1 });

// Check if promo code is valid
promoCodeSchema.methods.isValid = function (orderAmount, userId = null) {
    const now = new Date();

    // Check if active
    if (!this.isActive) {
        return { valid: false, message: 'Promo code is not active' };
    }

    // Check validity period
    if (this.validFrom && now < this.validFrom) {
        return { valid: false, message: 'Promo code is not yet valid' };
    }

    if (this.validUntil && now > this.validUntil) {
        return { valid: false, message: 'Promo code has expired' };
    }

    // Check usage limit
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Promo code usage limit reached' };
    }

    // Check per user usage
    if (userId) {
        const userUsage = this.usedBy.find(
            (u) => u.user.toString() === userId.toString()
        );
        if (userUsage && userUsage.usageCount >= this.usagePerUser) {
            return {
                valid: false,
                message: 'You have already used this promo code maximum times',
            };
        }
    }

    // Check minimum order amount
    if (this.minOrderAmount && orderAmount < this.minOrderAmount) {
        return {
            valid: false,
            message: `Minimum order amount is ৳${this.minOrderAmount}`,
        };
    }

    return { valid: true };
};

// Calculate discount amount
promoCodeSchema.methods.calculateDiscount = function (orderAmount) {
    let discount = 0;

    if (this.discountType === 'percentage') {
        discount = (orderAmount * this.discountValue) / 100;
        if (this.maxDiscount) {
            discount = Math.min(discount, this.maxDiscount);
        }
    } else {
        discount = this.discountValue;
    }

    return Math.min(discount, orderAmount);
};

// Apply promo code
promoCodeSchema.methods.apply = async function (userId) {
    this.usedCount += 1;

    const userUsageIndex = this.usedBy.findIndex(
        (u) => u.user.toString() === userId.toString()
    );

    if (userUsageIndex >= 0) {
        this.usedBy[userUsageIndex].usageCount += 1;
        this.usedBy[userUsageIndex].lastUsed = new Date();
    } else {
        this.usedBy.push({
            user: userId,
            usageCount: 1,
            lastUsed: new Date(),
        });
    }

    await this.save();
};

// Get usage statistics
promoCodeSchema.methods.getStats = function () {
    return {
        code: this.code,
        totalUsed: this.usedCount,
        remainingUses: this.usageLimit ? this.usageLimit - this.usedCount : 'Unlimited',
        uniqueUsers: this.usedBy.length,
        isActive: this.isActive,
        isExpired: this.validUntil ? new Date() > this.validUntil : false,
    };
};

export default mongoose.model('PromoCode', promoCodeSchema);