const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const configController = require('../controllers/configController');
const auth = require('../middleware/auth');

// @route   POST /api/config/save
// @desc    Save site configuration
// @access  Private
router.post(
  '/save',
  auth,
  [
    check('institutionName', 'Institution name is required').not().isEmpty(),
    check('sedeInputs', 'Sede inputs is required').isArray(),
    check('informAcademic', 'Inform academic is required').not().isEmpty()
  ],
  configController.saveSiteConfiguration
);

module.exports = router;
