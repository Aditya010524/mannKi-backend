const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // custom Cloudinary config

// Storage setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'twitter_media',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'mp4', 'mov'],
    resource_type: 'auto', // allows both images and videos
  },
});

const upload = multer({ storage });

module.exports = upload;
