import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');

    if (isVideo) {
      return {
        folder: 'social-app/media/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
        transformation: [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }],
      };
    } else {
      return {
        folder: 'social-app/media/images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 2048, height: 2048, crop: 'limit', quality: 'auto' }],
      };
    }
  },
});

// File filter for media uploads
const mediaFileFilter = (req, file, cb) => {
  const supportedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const supportedVideos = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  const supportedTypes = [...supportedImages, ...supportedVideos];

  if (supportedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// Media upload configuration
const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 4, // Maximum 4 files per upload
  },
});

export { mediaUpload, cloudinary };
