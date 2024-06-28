const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const registerController = require('../controllers/registerController');
const multer = require('multer');
const path = require('path');

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
  upload.single('photo'),
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
    check('matriculationDate', 'Matriculation date is required').not().isEmpty().isISO8601().toDate(),
    check('fatherName', 'Father name is required').not().isEmpty().trim().escape(),
    check('motherName', 'Mother name is required').not().isEmpty().trim().escape(),
    check('siblings', 'Number of siblings is required').isInt({ min: 0 }),
    check('livingWith', 'Living with is required').not().isEmpty().trim().escape(),
    check('stratum', 'Stratum is required').not().isEmpty().trim().escape(),
    check('residenceAddress', 'Residence address is required').not().isEmpty().trim().escape(),
    check('previousSchool', 'Previous school is required').not().isEmpty().trim().escape(),
    check('academicReport', 'Academic report is required').not().isEmpty().trim().escape(),
    check('sedeMatricula', 'Sede matricula is required').not().isEmpty().trim().escape(),
    check('studentFromPreviousInstitution', 'Student from previous institution is required').isBoolean(),
    check('repeatAcademicYear', 'Repeat academic year is required').isBoolean(),
    check('hasAllergy', 'Has allergy is required').isBoolean(),
    check('allergy', 'Allergy is required').optional().trim().escape(),
    check('bloodType', 'Blood type is required').not().isEmpty().trim().escape(),
    check('hasDisease', 'Has disease is required').isBoolean(),
    check('disease', 'Disease is required').optional().trim().escape(),
    check('medicalExam', 'Medical exam is required').not().isEmpty().trim().escape(),
    check('grade', 'Grade is required').not().isEmpty().trim().escape(),
    check('tutors', 'Tutors are required').isArray(),
    check('tutors.*.name', 'Tutor name is required').not().isEmpty().trim().escape(),
    check('tutors.*.lastName', 'Tutor last name is required').not().isEmpty().trim().escape(),
    check('tutors.*.email', 'Tutor email is required').isEmail().normalizeEmail(),
    check('tutors.*.relation', 'Tutor relation is required').not().isEmpty().trim().escape(),
    check('tutors.*.relationOther', 'Tutor relation other is optional').optional().trim().escape(),
    check('tutors.*.photo', 'Tutor photo is required').optional().trim().escape()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  registerController.register
);

module.exports = router;
