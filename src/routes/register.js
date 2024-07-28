const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const registerController = require('../controllers/registerController');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// Configurar multer para la carga de archivos con nombres únicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Asegurar que la ruta es correcta
  },
  filename: function (req, file, cb) {
    // Generar un nombre único utilizando un hash
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo archivos de imagen
  if (!file.mimetype.startsWith('image')) {
    return cb(new Error('File is not an image'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 // Limitar el tamaño del archivo a 1MB
  }
});

// @route   POST /api/register
// @desc    Register user
// @access  Public
router.post(
  '/',
  tenantMiddleware,
  upload.fields([
    { name: 'academicReport', maxCount: 1 },
    { name: 'studentDocument', maxCount: 1 },
    { name: 'tutorDocument', maxCount: 1 },
    { name: 'consignmentReceipt', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
  ]), // Asegúrate de que esto coincida con el nombre del campo de archivo en tu frontend
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }).trim().escape(),
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('lastName', 'Last name is required').not().isEmpty().trim().escape(),
    check('address', 'Address is required').not().isEmpty().trim().escape(),
    check('phoneNumber', 'Phone number is required').not().isEmpty().trim().escape(),
    check('documentType', 'Document type is required').not().isEmpty().trim().escape(),
    check('documentNumber', 'Document number is required').not().isEmpty().trim().escape(),
    check('expeditionDepartment', 'Expedition department is required').not().isEmpty().trim().escape(),
    check('expeditionCity', 'Expedition city is required').not().isEmpty().trim().escape(),
    check('birthDate', 'Birth date is required').not().isEmpty().isISO8601().toDate(),
    check('grade', 'Grade is required').not().isEmpty().trim().escape(),
    check('previousSchool', 'Previous school is required').not().isEmpty().trim().escape(),
    check('sedeMatricula', 'Sede Matricula is required').not().isEmpty().trim().escape(),
    check('studentFromPreviousInstitution', 'Student From Previous Institution is required').not().isEmpty().trim().escape(),
    check('repeatAcademicYear', 'Repeat Academic Year is required').not().isEmpty().trim().escape(),
    check('hasAllergy', 'Has Allergy is required').not().isEmpty().trim().escape(),
    check('allergy', 'Allergy is required if Has Allergy is true').optional({ checkFalsy: true }).trim().escape(),
    check('bloodType', 'Blood Type is required').not().isEmpty().trim().escape(),
    check('hasDisease', 'Has Disease is required').not().isEmpty().trim().escape(),
    check('disease', 'Disease is required if Has Disease is true').optional({ checkFalsy: true }).trim().escape(),
    check('fatherName', 'Father Name is required').not().isEmpty().trim().escape(),
    check('motherName', 'Mother Name is required').not().isEmpty().trim().escape(),
    check('siblings', 'Siblings is required').not().isEmpty().trim().escape(),
    check('livingWith', 'Living With is required').not().isEmpty().trim().escape(),
    check('stratum', 'Stratum is required').not().isEmpty().trim().escape(),
    check('residenceAddress', 'Residence Address is required').not().isEmpty().trim().escape(),
    // Agrega cualquier otro campo de validación necesario
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Log para depuración
    console.log('Received body data:', req.body);
    console.log('Received files:', req.files);
    next();
  },
  registerController.register
);

module.exports = router;
