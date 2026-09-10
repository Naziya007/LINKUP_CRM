const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for images & videos
});

// @route POST /api/upload
router.post('/', protect, upload.any(), async (req, res) => {
  try {
    const uploadedFile = req.files && req.files.length > 0 ? req.files[0] : req.file;
    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'linkup_cms';

    // Check if Cloudinary is configured with real credentials
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo';

    if (isCloudinaryConfigured) {
      // Upload stream to real Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error (falling back to Data URL):', error.message || error);
            const base64Data = uploadedFile.buffer.toString('base64');
            const mimeType = uploadedFile.mimetype || 'image/png';
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            const fakePublicId = `${folder}/${Date.now()}_${uploadedFile.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`;

            return res.json({
              success: true,
              url: dataUrl,
              publicId: fakePublicId
            });
          }
          return res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      uploadStream.end(uploadedFile.buffer);
    } else {
      // Data URL fallback when Cloudinary key is not provided yet
      const base64Data = uploadedFile.buffer.toString('base64');
      const mimeType = uploadedFile.mimetype || 'image/png';
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      const fakePublicId = `${folder}/${Date.now()}_${uploadedFile.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`;

      return res.json({
        success: true,
        url: dataUrl,
        publicId: fakePublicId
      });
    }
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
