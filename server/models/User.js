import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number'],
            match: [/^(\+88)?01[3-9]\d{8}$/, 'Please provide a valid Bangladesh phone number'],
        },
        avatar: {
            type: String,
            default: '',
        },
        avatarPublicId: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        hall: {
            type: String,
            required: [true, 'Please provide your hall name'],
            enum: [
                'Amar Ekushey Hall',
                'Shaheed Abdur Rab Hall',
                'Shah Jalal Hall',
                'Shamsun Nahar Hall',
                'Dr. M. A. Rashid Hall',
                'Others',
            ],
        },
        department: {
            type: String,
            enum: [
                'Civil Engineering',
                'Electrical & Electronic Engineering',
                'Mechanical Engineering',
                'Computer Science & Engineering',
                'Architecture',
                'Urban & Regional Planning',
                'Building Engineering & Construction Management',
                'Chemical Engineering',
                'Petroleum & Mining Engineering',
                'Materials & Metallurgical Engineering',
                'Industrial & Production Engineering',
                'Mathematics',
                'Physics',
                'Chemistry',
                'Humanities',
                'Others',
            ],
        },
        studentId: {
            type: String,
            sparse: true, // Allows null values but ensures uniqueness when present
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        addresses: [
            {
                label: String,
                hall: { type: String },
                room: String,
                floor: String,
                building: String,
                notes: String,
                isDefault: { type: Boolean, default: false },
            },
        ],
        settings: {
            emailNotifications: { type: Boolean, default: true },
            orderUpdates: { type: Boolean, default: true },
            promotions: { type: Boolean, default: false },
            newsletter: { type: Boolean, default: false },
            twoFactorAuth: { type: Boolean, default: false },
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastLogin: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's orders
userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user',
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
    const verificationToken = jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    this.emailVerificationToken = verificationToken;
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    this.resetPasswordToken = resetToken;
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    return resetToken;
};

export default mongoose.model('User', userSchema);