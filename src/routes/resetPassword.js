const express = require('express');
const router = express.Router();
const resetPasswordController = require('../controllers/resetPasswordController');

// Ruta para mostrar el formulario de restablecimiento de contraseña
router.get('/:token', resetPasswordController.renderResetPasswordPage);

module.exports = router;
