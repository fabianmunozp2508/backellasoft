const express = require('express');
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/passwordResetController');
const router = express.Router();

// Ruta para solicitar la recuperación de contraseña
router.post('/forgot-password', [
  check('email').isEmail().withMessage('Please include a valid email').normalizeEmail()
], authController.forgotPassword);

// Ruta para restablecer la contraseña mediante el token y enviar la nueva contraseña generada
router.post('/reset-password', [
  check('token').notEmpty().withMessage('Token is required')
], authController.resetPassword);

module.exports = router;
