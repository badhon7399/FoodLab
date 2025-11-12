import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for food images
const foodStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'foodlab/menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
        ],
    },
});

// Cloudinary storage for user avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'foodlab/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
        ],
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Upload middleware
export const uploadFoodImage = multer({
    storage: foodStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

export default cloudinary;