const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const tenantMiddleware = require('../middleware/tenantMiddleware'); // Middleware para manejo de tenant

router.post('/institution', auth, tenantMiddleware, institutionController.createInstitution);
router.get('/institution', auth, tenantMiddleware, institutionController.getInstitution);
router.put('/institution', auth, tenantMiddleware, institutionController.updateInstitution);
router.delete('/institution', auth, tenantMiddleware, institutionController.deleteInstitution);

router.post('/educational-site', auth, tenantMiddleware, institutionController.createEducationalSite);
router.get('/educational-sites', auth, tenantMiddleware, institutionController.getEducationalSites);
router.put('/educational-site', auth, tenantMiddleware, institutionController.updateEducationalSite);
router.delete('/educational-site', auth, tenantMiddleware, institutionController.deleteEducationalSite);

router.delete('/sede', auth, tenantMiddleware, institutionController.removeSede);
router.delete('/logo', auth, tenantMiddleware, institutionController.removeLogo);
router.delete('/banner', auth, tenantMiddleware, institutionController.removeBanner);
router.delete('/signature/:signatureType', auth, tenantMiddleware, institutionController.removeSignature);

module.exports = router;
