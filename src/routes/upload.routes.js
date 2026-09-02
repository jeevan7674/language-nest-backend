const express = require('express');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Configure multer with memory storage and image file filter
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed!'), false);
    }
  },
});

// Protected upload and delete routes
router.post('/image', authenticate, upload.single('file'), uploadImage);
router.delete('/image', authenticate, deleteImage);

module.exports = router;
