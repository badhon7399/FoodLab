import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            required: [true, 'Please provide a comment'],
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        images: [
            {
                url: String,
                publicId: String,
            },
        ],
        isApproved: {
            type: Boolean,
            default: false,
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        adminReply: {
            type: String,
            maxlength: [500, 'Reply cannot exceed 500 characters'],
        },
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        repliedAt: {
            type: Date,
        },
        helpful: {
            type: Number,
            default: 0,
        },
        notHelpful: {
            type: Number,
            default: 0,
        },
        reportCount: {
            type: Number,
            default: 0,
        },
        reportReasons: [
            {
                reason: String,
                reportedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                reportedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
reviewSchema.index({ food: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ user: 1, food: 1 }, { unique: true }); // One review per user per food

// Update food rating after review is saved
reviewSchema.post('save', async function () {
    if (this.isApproved) {
        await this.constructor.updateFoodRating(this.food);
    }
});

// Update food rating after review is deleted
reviewSchema.post('remove', async function () {
    await this.constructor.updateFoodRating(this.food);
});

// Static method to update food rating
reviewSchema.statics.updateFoodRating = async function (foodId) {
    const stats = await this.aggregate([
        {
            $match: {
                food: foodId,
                isApproved: true,
            },
        },
        {
            $group: {
                _id: '$food',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    try {
        await mongoose.model('Food').findByIdAndUpdate(foodId, {
            rating: stats[0]?.averageRating || 0,
            reviewCount: stats[0]?.reviewCount || 0,
        });
    } catch (error) {
        console.error('Error updating food rating:', error);
    }
};

// Mark helpful
reviewSchema.methods.markHelpful = async function () {
    this.helpful += 1;
    await this.save();
};

// Mark not helpful
reviewSchema.methods.markNotHelpful = async function () {
    this.notHelpful += 1;
    await this.save();
};

// Report review
reviewSchema.methods.report = async function (reason, reportedBy) {
    this.reportCount += 1;
    this.reportReasons.push({ reason, reportedBy });
    await this.save();
};

export default mongoose.model('Review', reviewSchema);