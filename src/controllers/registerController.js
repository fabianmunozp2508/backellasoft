const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Pool } = require('pg');
const mongoose = require('mongoose');

const pool = new Pool({ connectionString: config.get('postgresURI') });

mongoose.connect(config.get('mongoURI'), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: String,
  tenant_id: Number,
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const MongoUser = mongoose.model('MongoUser', userSchema);

exports.register = [
  body('tenant_id').notEmpty().withMessage('Tenant ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('lastName').notEmpty().withMessage('Last Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password with min 6 characters is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      tenant_id,
      name,
      lastName,
      email,
      password
    } = req.body;

    if (!tenant_id) {
      return res.status(400).json({ message: 'No tenant specified' });
    }

    try {
      let institution = await pool.query('SELECT * FROM "Institution" WHERE tenant_id = $1', [tenant_id]);
      if (institution.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid tenant_id' });
      }

      let user = await pool.query('SELECT * FROM "Users" WHERE email = $1 AND tenant_id = $2', [email, tenant_id]);
      if (user.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Crear el usuario en MongoDB
      const mongoUser = new MongoUser({ name, lastName, email, tenant_id });
      await mongoUser.save();
      const mongoUserId = mongoUser._id.toString();  // Convertir ObjectId a cadena

      // Crear el usuario en PostgreSQL
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const result = await pool.query(
        'INSERT INTO "Users" (email, password, tenant_id, name, "lastName", "mongoUserId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        [
          email,
          hashedPassword,
          tenant_id,
          name,
          lastName,
          mongoUserId  // Asegúrate de pasar el ID de MongoDB como cadena completa
        ]
      );
      const userId = result.rows[0].id;

      const payload = {
        user: {
          id: userId,
          role: 'user',
          tenant_id: tenant_id
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
      console.error('Error in user registration process:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
];
