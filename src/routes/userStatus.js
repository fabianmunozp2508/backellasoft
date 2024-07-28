const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const userStatusController = require('../controllers/userStatusController');
const tenantMiddleware = require('../middleware/tenantMiddleware');

router.post(
  '/',
  tenantMiddleware,
  [
    check('userId').isInt(),
    check('isActiveUser').isBoolean(),
    check('matriculationDate').optional().isISO8601(),
    check('rol').not().isEmpty(),
    check('status').not().isEmpty()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userStatusController.createUserStatus
);

router.get('/:userId', tenantMiddleware, userStatusController.getUserStatus);
router.put('/:userId', tenantMiddleware, userStatusController.updateUserStatus);
router.delete('/:userId', tenantMiddleware, userStatusController.deleteUserStatus);

module.exports = router;
