const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const registerController = require('../controllers/registerController');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// @route   POST /api/register
// @desc    Register user
// @access  Public
router.post(
  '/',
  tenantMiddleware,
  [
    check('tenant_id', 'Tenant ID is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }).trim().escape(),
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('lastName', 'Last name is required').not().isEmpty().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Log para depuración
    console.log('Received body data:', req.body);
    next();
  },
  registerController.register
);

module.exports = router;
