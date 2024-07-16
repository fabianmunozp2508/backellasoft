// src/controllers/registerController.js
const User = require('../models/User');
const DataRegister = require('../models/DataRegister');
const AdditionalInfo = require('../models/AdditionalInfo');
const TutorsInfo = require('../models/TutorsInfo');
const FamilyInfo = require('../models/FamilyInfo');
const Files = require('../models/Files');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
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
    photoUrl,
    grade,
    previousSchool,
    sedeMatricula,
    studentFromPreviousInstitution,
    repeatAcademicYear,
    hasAllergy,
    allergy,
    bloodType,
    hasDisease,
    disease,
    fatherName,
    motherName,
    siblings,
    livingWith,
    stratum,
    residenceAddress,
    tutors,
    studentDocument,
    tutorDocument,
    consignmentReceipt
  } = req.body;

  const tenantId = req.tenant_id;

  console.log('Request body:', req.body);

  try {
    console.log('Starting user registration process...');
    
    // Verificar si el usuario ya existe
    let user = await pool.query('SELECT * FROM "Users" WHERE email = $1 AND tenant_id = $2', [email, tenantId]);
    if (user.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user in PostgreSQL...');
    // Crear un nuevo usuario en PostgreSQL
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO "Users" (email, password, tenant_id) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, tenantId]
    );
    const userId = result.rows[0].id;

    // Generar un ID de estudiante aleatorio
    const studentId = crypto.randomBytes(12).toString('hex');

    console.log('User created in PostgreSQL with ID:', userId);

    // Guardar los datos de registro en MongoDB
    const dataRegister = new DataRegister({
      studentId,
      userId,
      tenantId,
      email,
      name,
      lastName,
      address,
      phoneNumber,
      documentType,
      documentNumber,
      expeditionDepartment,
      expeditionCity,
      birthDate,
      photo: photoUrl
    });
    await dataRegister.save();
    console.log('User data registered in MongoDB');

    // Guardar información adicional en MongoDB
    const additionalInfo = new AdditionalInfo({
      studentId,
      tenantId,
      grade,
      previousSchool,
      sedeMatricula,
      studentFromPreviousInstitution,
      repeatAcademicYear,
      hasAllergy,
      allergy,
      bloodType,
      hasDisease,
      disease
    });
    await additionalInfo.save();
    console.log('Additional info registered in MongoDB');

    // Guardar información de tutores en MongoDB
    const tutorsInfo = new TutorsInfo({
      studentId,
      tenantId,
      tutors
    });
    await tutorsInfo.save();
    console.log('Tutors info registered in MongoDB');

    // Guardar información familiar en MongoDB
    const familyInfo = new FamilyInfo({
      studentId,
      tenantId,
      fatherName,
      motherName,
      siblings,
      livingWith,
      stratum,
      residenceAddress
    });
    await familyInfo.save();
    console.log('Family info registered in MongoDB');

    // Guardar archivos en MongoDB
    const files = new Files({
      studentId,
      tenantId,
      studentDocument,
      tutorDocument,
      consignmentReceipt
    });
    await files.save();
    console.log('Files registered in MongoDB');

    // Agregar el usuario a la colección de preinscritos en PostgreSQL
    const prematriculado = {
      studentId,
      userId,
      tenantId,
      email,
      name,
      lastName
    };
    await pool.query(
      'INSERT INTO prematriculados (studentid, userid, tenantid, email, name, lastname) VALUES ($1, $2, $3, $4, $5, $6)',
      [prematriculado.studentId, prematriculado.userId, prematriculado.tenantId, prematriculado.email, prematriculado.name, prematriculado.lastName]
    );
    console.log('User added to prematriculados collection');

    // Crear y enviar el token
    const payload = {
      user: {
        id: userId,
        role: 'user',
        tenant_id: tenantId
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log('Token generated and sent to client');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error in user registration process:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
