import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'BDT',
        },
        paymentMethod: {
            type: String,
            enum: ['Bkash', 'Cash on Delivery', 'Card', 'Nagad', 'Rocket'],
            required: true,
        },
        paymentGateway: {
            type: String,
            enum: ['Bkash', 'SSL Commerce', 'Stripe', 'PayPal', 'Manual'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
            default: 'Pending',
        },
        paymentGatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
        },
        senderAccount: {
            type: String,
        },
        receiverAccount: {
            type: String,
        },
        trxID: {
            type: String,
        },
        paymentID: {
            type: String,
        },
        invoiceNumber: {
            type: String,
        },
        paidAt: {
            type: Date,
        },
        refundedAt: {
            type: Date,
        },
        refundReason: {
            type: String,
            maxlength: 500,
        },
        refundedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        refundAmount: {
            type: Number,
            min: 0,
        },
        failureReason: {
            type: String,
            maxlength: 500,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        notes: {
            type: String,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ user: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });
transactionSchema.index({ createdAt: -1 });

// Auto-generate transaction ID
transactionSchema.pre('save', async function (next) {
    if (!this.transactionId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        this.transactionId = `TXN${timestamp}${random}`;
    }
    next();
});

// Mark as paid
transactionSchema.methods.markAsPaid = async function () {
    this.status = 'Completed';
    this.paidAt = new Date();
    await this.save();
};

// Mark as failed
transactionSchema.methods.markAsFailed = async function (reason) {
    this.status = 'Failed';
    this.failureReason = reason;
    await this.save();
};

// Process refund
transactionSchema.methods.processRefund = async function (refundAmount, reason, refundedBy) {
    this.status = 'Refunded';
    this.refundedAt = new Date();
    this.refundReason = reason;
    this.refundedBy = refundedBy;
    this.refundAmount = refundAmount || this.amount;
    await this.save();
};

// Static method to get revenue statistics
transactionSchema.statics.getRevenueStats = async function (dateRange = null) {
    const match = { status: 'Completed' };
    if (dateRange) match.createdAt = dateRange;

    return await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                averageTransactionValue: { $avg: '$amount' },
            },
        },
    ]);
};

// Get payment method distribution
transactionSchema.statics.getPaymentMethodStats = async function (dateRange = null) {
    const match = { status: 'Completed' };
    if (dateRange) match.createdAt = dateRange;

    return await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
            },
        },
        { $sort: { count: -1 } },
    ]);
};

export default mongoose.model('Transaction', transactionSchema);