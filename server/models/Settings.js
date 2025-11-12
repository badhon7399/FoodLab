import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        // General Settings
        siteName: {
            type: String,
            default: 'Food Lab',
        },
        siteDescription: {
            type: String,
            default: 'Tasty, Healthy, Hygienic - Made for Cuetians',
        },
        siteUrl: {
            type: String,
        },
        contactEmail: {
            type: String,
            default: 'support@foodlab.com',
        },
        contactPhone: {
            type: String,
            default: '+880 1234567890',
        },
        address: {
            type: String,
            default: 'Chittagong University of Engineering and Technology',
        },
        logo: {
            type: String,
        },
        favicon: {
            type: String,
        },

        // Business Hours
        businessHours: {
            monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
            tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
            wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
            thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
            friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
            saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
            sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
        },

        // Payment Settings
        payment: {
            bkashEnabled: {
                type: Boolean,
                default: true,
            },
            bkashMerchantNumber: String,
            codEnabled: {
                type: Boolean,
                default: true,
            },
            deliveryFee: {
                type: Number,
                default: 30,
            },
            freeDeliveryThreshold: {
                type: Number,
                default: 200,
            },
            taxRate: {
                type: Number,
                default: 0,
            },
        },

        // Order Settings
        orders: {
            orderPrefix: {
                type: String,
                default: 'ORD',
            },
            autoApprove: {
                type: Boolean,
                default: false,
            },
            minOrderAmount: {
                type: Number,
                default: 0,
            },
            maxOrderAmount: {
                type: Number,
                default: 5000,
            },
            estimatedDeliveryTime: {
                type: Number, // in minutes
                default: 30,
            },
            cancelOrderTimeLimit: {
                type: Number, // in minutes
                default: 5,
            },
        },

        // Notification Settings
        notifications: {
            emailNewOrder: {
                type: Boolean,
                default: true,
            },
            emailNewUser: {
                type: Boolean,
                default: true,
            },
            emailLowStock: {
                type: Boolean,
                default: false,
            },
            pushNewOrder: {
                type: Boolean,
                default: true,
            },
            pushPaymentReceived: {
                type: Boolean,
                default: true,
            },
            pushNewReview: {
                type: Boolean,
                default: false,
            },
            smsEnabled: {
                type: Boolean,
                default: false,
            },
        },

        // Social Media Links
        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String,
            youtube: String,
        },

        // SEO Settings
        seo: {
            metaTitle: String,
            metaDescription: String,
            metaKeywords: [String],
            ogImage: String,
        },

        // Email Templates
        emailTemplates: {
            orderConfirmation: {
                subject: String,
                body: String,
            },
            orderDelivered: {
                subject: String,
                body: String,
            },
            welcome: {
                subject: String,
                body: String,
            },
        },

        // Maintenance Mode
        maintenance: {
            enabled: {
                type: Boolean,
                default: false,
            },
            message: {
                type: String,
                default: 'We are currently under maintenance. Please check back later.',
            },
        },

        // Analytics
        analytics: {
            googleAnalyticsId: String,
            facebookPixelId: String,
        },

        // Last Updated
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one settings document exists
settingsSchema.statics.getInstance = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

// Get specific setting value
settingsSchema.statics.getValue = async function (path) {
    const settings = await this.getInstance();
    return path.split('.').reduce((obj, key) => obj?.[key], settings);
};

// Update specific setting
settingsSchema.statics.updateValue = async function (path, value, userId) {
    const settings = await this.getInstance();
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], settings);
    target[lastKey] = value;
    settings.lastUpdatedBy = userId;
    await settings.save();
    return settings;
};

export default mongoose.model('Settings', settingsSchema);