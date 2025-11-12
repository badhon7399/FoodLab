import { uploadFoodImage, uploadAvatar } from '../config/cloudinary.js';

// Middleware to handle single food image upload
export const uploadSingleFoodImage = (req, res, next) => {
    const upload = uploadFoodImage.single('image');

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        // Add image URL to request body
        if (req.file) {
            req.body.image = req.file.path;
            req.body.imagePublicId = req.file.filename;
        }

        next();
    });
};

// Middleware to handle multiple food images
export const uploadMultipleFoodImages = (req, res, next) => {
    const upload = uploadFoodImage.array('images', 5);

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => ({
                url: file.path,
                publicId: file.filename,
            }));
        }

        next();
    });
};

// Middleware to handle avatar upload
export const uploadUserAvatar = (req, res, next) => {
    const upload = uploadAvatar.single('avatar');

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        if (req.file) {
            req.body.avatar = req.file.path;
            req.body.avatarPublicId = req.file.filename;
        }

        next();
    });
};