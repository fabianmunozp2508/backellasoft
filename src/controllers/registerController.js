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
const path = require('path');

const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Log para depuración
  console.log('Received body data in controller:', req.body);
  console.log('Received files in controller:', req.files);

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
    matriculationDate // Asegúrate de incluir este campo
  } = req.body;

  const tenantId = req.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'No tenant specified' });
  }

  try {
    let user = await pool.query('SELECT * FROM "Users" WHERE email = $1 AND tenant_id = $2', [email, tenantId]);
    if (user.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user in PostgreSQL...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO "Users" (email, password, tenant_id) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, tenantId]
    );
    const userId = result.rows[0].id;
    console.log('User created in PostgreSQL with ID:', userId);

    const studentId = crypto.randomBytes(12).toString('hex');

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
      photo: req.files && req.files.photo ? `${req.protocol}://${req.get('host')}/uploads/${req.files.photo[0].filename}` : '',
      matriculationDate
    });
    await dataRegister.save();

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

    const tutorsInfo = new TutorsInfo({
      studentId,
      tenantId,
      tutors
    });
    await tutorsInfo.save();

    const familyInfo = new FamilyInfo({
      studentId,
      tenantId,
      fatherName,
      motherName,
      siblings: parseInt(siblings, 10),
      livingWith,
      stratum,
      residenceAddress
    });
    await familyInfo.save();

    const generateFileUrl = (file) => {
      return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    };

    const files = new Files({
      studentId,
      tenantId,
      studentDocument: req.files && req.files.studentDocument ? generateFileUrl(req.files.studentDocument[0]) : null,
      tutorDocument: req.files && req.files.tutorDocument ? generateFileUrl(req.files.tutorDocument[0]) : null,
      consignmentReceipt: req.files && req.files.consignmentReceipt ? generateFileUrl(req.files.consignmentReceipt[0]) : null
    });
    await files.save();

    const prematriculado = {
      studentId,
      userId,
      tenantId,
      email,
      name,
      lastName,
      matriculationDate
    };
    await pool.query(
      'INSERT INTO prematriculados (studentid, userid, tenant_id, email, name, lastname, matriculationdate) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [prematriculado.studentId, prematriculado.userId, prematriculado.tenantId, prematriculado.email, prematriculado.name, prematriculado.lastName, prematriculado.matriculationDate]
    );

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
