import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Order must belong to a user'],
        },
        items: [
            {
                food: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                image: String,
                price: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
                },
                size: String,
                addOns: [
                    {
                        name: String,
                        price: Number,
                    },
                ],
            },
        ],
        deliveryDetails: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            hall: {
                type: String,
                required: true,
            },
            department: String,
            roomNumber: String,
            instructions: {
                type: String,
                maxlength: [200, 'Instructions cannot exceed 200 characters'],
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ['Bkash', 'Cash on Delivery', 'Card'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded'],
            default: 'Pending',
        },
        transactionId: {
            type: String,
            sparse: true,
        },
        promoCode: {
            type: String,
            uppercase: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        statusHistory: [
            {
                status: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                note: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
        estimatedDeliveryTime: {
            type: Date,
        },
        actualDeliveryTime: {
            type: Date,
        },
        deliveryPerson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            maxlength: 500,
        },
        cancelReason: {
            type: String,
            maxlength: 200,
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        cancelledAt: Date,
        notes: {
            type: String,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        const prefix = process.env.ORDER_PREFIX || 'ORD';
        this.orderId = `${prefix}${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Add status to history when status changes
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
        });
    }
    next();
});

// Virtual for order duration
orderSchema.virtual('orderDuration').get(function () {
    if (this.actualDeliveryTime) {
        return Math.round((this.actualDeliveryTime - this.createdAt) / (1000 * 60)); // in minutes
    }
    return null;
});

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
    return ['Pending', 'Confirmed'].includes(this.status);
};

// Calculate total
orderSchema.methods.calculateTotal = function () {
    this.subtotal = this.items.reduce((sum, item) => {
        let itemTotal = item.price * item.quantity;
        if (item.addOns && item.addOns.length > 0) {
            itemTotal += item.addOns.reduce((addOnSum, addOn) => addOnSum + addOn.price, 0) * item.quantity;
        }
        return sum + itemTotal;
    }, 0);

    this.totalAmount = this.subtotal + this.deliveryFee + this.tax - this.discount;
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function (userId = null, dateRange = null) {
    const match = {};
    if (userId) match.user = userId;
    if (dateRange) match.createdAt = dateRange;

    return await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' },
                completedOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] },
                },
                cancelledOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] },
                },
            },
        },
    ]);
};

export default mongoose.model('Order', orderSchema);