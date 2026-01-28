const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const carController = require('../controllers/carController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Cloudinary storage with dynamic params based on fieldname
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'photos') {
      return {
        folder: 'car_inventory/photos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      };
    } else if (file.fieldname === 'video') {
      return {
        folder: 'car_inventory/videos',
        allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
        resource_type: 'video'
      };
    }
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photos') {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files are allowed for photos'));
  }
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    return cb(new Error('Only video files are allowed for video'));
  }
  cb(null, false);
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB max per file
});

// create with files: photos (array), video (single)
router.post('/car-entry', auth, upload.fields([{ name: 'photos', maxCount: 6 }, { name: 'video', maxCount: 1 }]), carController.createCar);
router.get('/dashboard', auth, carController.getStats);
router.get('/car-records', auth, carController.getAllCars);
router.get('/car/:id', auth, carController.getCar);
router.put('/car/:id', auth, upload.fields([{ name: 'photos', maxCount: 6 }, { name: 'video', maxCount: 1 }]), carController.updateCar);
router.delete('/car/:id', auth, carController.deleteCar);
router.delete('/car/:id/photos/:index', auth, admin, carController.deletePhoto);
router.delete('/car/:id/video', auth, admin, carController.deleteVideo);
router.get('/admin/export-cars', auth, admin, carController.exportCars);

module.exports = router;
