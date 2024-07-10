const User = require('../models/User');
const DataRegister = require('../models/DataRegister');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');
const { Pool } = require('pg');
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
    matriculationDate,
    photoUrl
  } = req.body;

  console.log('Request body:', req.body);

  try {
    console.log('Starting user registration process...');
    
    // Verificar si el usuario ya existe
    let user = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user in PostgreSQL...');
    // Crear un nuevo usuario en PostgreSQL
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO "Users" (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    const userId = result.rows[0].id;

    console.log('User created in PostgreSQL with ID:', userId);

    // Guardar los datos de registro en MongoDB
    const dataRegister = new DataRegister({
      userId: userId,
      email,  // Asegúrate de pasar el correo electrónico también
      name,
      lastName,
      address,
      phoneNumber,
      documentType,
      documentNumber,
      expeditionDepartment,
      expeditionCity,
      birthDate,
      photo: photoUrl, // Asegúrate de asignar photoUrl al campo photo
      matriculationDate
    });
    await dataRegister.save();
    console.log('User data registered in MongoDB');

    // Agregar el usuario a la colección de preinscritos
    const prematriculado = {
      userId,
      email,
      name,
      lastName,
      matriculationDate
    };
    await pool.query(
      'INSERT INTO prematriculados (userid, email, name, lastname, matriculationdate) VALUES ($1, $2, $3, $4, $5)',
      [prematriculado.userId, prematriculado.email, prematriculado.name, prematriculado.lastName, prematriculado.matriculationDate]
    );
    console.log('User added to prematriculados collection');

    // Crear y enviar el token
    const payload = {
      user: {
        id: userId,
        role: 'user'
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
