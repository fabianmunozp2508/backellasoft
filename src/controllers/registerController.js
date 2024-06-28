const User = require('../models/User');
const FamilyInfo = require('../models/FamilyInfo');
const UploadFile = require('../models/UploadFile');
const AdditionalInfo = require('../models/AdditionalInfo');
const Tutor = require('../models/Tutor');
const DataRegister = require('../models/DataRegister');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');
const path = require('path');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    lastName,
    email,
    password,
    address,
    phoneNumber,
    documentType,
    documentNumber,
    expeditionDepartment,
    expeditionCity,
    birthDate,
    matriculationDate,
    fatherName,
    motherName,
    siblings,
    livingWith,
    stratum,
    residenceAddress,
    previousSchool,
    academicReport,
    sedeMatricula,
    studentFromPreviousInstitution,
    repeatAcademicYear,
    hasAllergy,
    allergy,
    bloodType,
    hasDisease,
    disease,
    medicalExam,
    grade,
    tutors
  } = req.body;

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Crear una nueva instancia de usuario
    user = new User({
      email,
      password
    });

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Guardar el usuario en la base de datos
    await user.save();

    // Guardar los datos de registro en la subcolección
    const dataRegister = new DataRegister({
      userId: user.id,
      name,
      lastName,
      address,
      phoneNumber,
      documentType,
      documentNumber,
      expeditionDepartment,
      expeditionCity,
      birthDate,
      photo: req.file.filename, // Guardar el nombre del archivo de la foto
      matriculationDate
    });
    await dataRegister.save();

    // Crear subcolecciones
    const familyInfo = new FamilyInfo({
      userId: user.id,
      fatherName,
      motherName,
      siblings,
      livingWith,
      stratum,
      residenceAddress
    });
    await familyInfo.save();

    const additionalInfo = new AdditionalInfo({
      userId: user.id,
      previousSchool,
      academicReport,
      sedeMatricula,
      studentFromPreviousInstitution,
      repeatAcademicYear,
      hasAllergy,
      allergy,
      bloodType,
      hasDisease,
      disease,
      medicalExam,
      grade
    });
    await additionalInfo.save();

    // Crear registros de tutores
    if (tutors && Array.isArray(tutors)) {
      for (const tutor of tutors) {
        const newTutor = new Tutor({
          userId: user.id,
          name: tutor.name,
          lastName: tutor.lastName,
          email: tutor.email,
          relation: tutor.relation,
          relationOther: tutor.relationOther,
          photo: tutor.photo
        });
        await newTutor.save();
      }
    }

    // Crear y enviar el token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
