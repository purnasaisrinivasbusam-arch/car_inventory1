const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify', authMiddleware, authController.verify);

// User management routes (admin only)
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, authController.getUserById);
router.put('/users/:id', authMiddleware, adminMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

module.exports = router;