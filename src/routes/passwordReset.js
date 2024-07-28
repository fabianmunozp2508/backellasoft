const express = require('express');
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/passwordResetController');
const router = express.Router();

// Ruta para solicitar la recuperación de contraseña
router.post('/forgot-password', [
  check('email').isEmail().withMessage('Please include a valid email').normalizeEmail()
], authController.forgotPassword);

// Ruta para restablecer la contraseña
router.post('/reset-password', [
  check('token').notEmpty().withMessage('Token is required'),
  check('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.resetPassword);

module.exports = router;
