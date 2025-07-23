const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // your Cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'twitter_media',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image',
  },
});

const upload = multer({ storage });

module.exports = upload;
