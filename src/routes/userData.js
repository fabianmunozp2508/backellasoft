const express = require('express');
const router = express.Router();
const userDataController = require('../controllers/userDataController');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// Ruta para obtener los datos del usuario
router.get('/:userId', auth, tenantMiddleware, userDataController.getUserData);

// Ruta para obtener los datos del docente
router.get('/docente/:docenteId', auth, tenantMiddleware, userDataController.getDocenteData);

// Ruta para obtener los datos de todos los docentes
router.get('/todos-docentes', auth, tenantMiddleware, userDataController.getTodosDocentesData);

module.exports = router;
