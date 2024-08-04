const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Configurar la limitación de tasa de solicitudes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limitar cada IP a 100 solicitudes por ventana de 15 minutos
  message: 'Too many login attempts, please try again later'
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  loginLimiter,
  [
    check('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    check('password').exists().withMessage('Password is required').trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login
);

// @route   GET /api/auth/renew
// @desc    Renew token
// @access  Private
router.get('/renew', auth, authController.renewToken);

// @route   GET /api/auth/status
// @desc    Check token status
// @access  Private
router.get('/status', auth, authController.checkTokenStatus);

// @route   GET /api/auth/check-connection
// @desc    Check database connection
// @access  Public
router.get('/check-connection', authController.checkConnection);

module.exports = router;
