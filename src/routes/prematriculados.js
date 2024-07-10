const express = require('express');
const router = express.Router();
const prematriculadosController = require('../controllers/prematriculadosController');

// @route   GET /api/prematriculados
// @desc    Get pre-inscribed users
// @access  Public
router.get('/', prematriculadosController.getPreInscribedUserDetails);

module.exports = router;
