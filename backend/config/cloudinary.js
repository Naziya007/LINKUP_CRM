const cloudinary = require('cloudinary').v2;

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || 'demo').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '123456789').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || 'secret').trim();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

module.exports = cloudinary;
