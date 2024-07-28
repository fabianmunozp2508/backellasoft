// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const tenantId = req.tenant_id;

  console.log('Login request:', { email, tenantId });

  try {
    // Verificar si el usuario existe en PostgreSQL para el tenant específico
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM public."Users" WHERE email = $1 AND tenant_id = $2', [email, tenantId]);

    if (result.rows.length === 0) {
      client.release();
      console.log('User not registered');
      return res.status(400).json({ message: 'User not registered' });
    }

    const user = result.rows[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      client.release();
      console.log('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Consultar el estatus del usuario en user_institutional_status
    const statusResult = await client.query('SELECT * FROM public.user_institutional_status WHERE user_id = $1', [user.id]);

    if (statusResult.rows.length === 0) {
      client.release();
      console.log('User status not found');
      return res.status(404).json({ message: 'User status not found' });
    }

    const userStatus = statusResult.rows[0];
    client.release();

    // Crear y enviar el token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        tenant_id: tenantId,
        status: userStatus.status,
        isActive: userStatus.is_active_user,
        matriculationDate: userStatus.matriculation_date
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log('Token generated and sent to client');
        res.json({ token, userStatus }); // Enviar token y estado del usuario
      }
    );
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.renewToken = (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    const payload = {
      user: {
        id: decoded.user.id,
        role: decoded.user.role,
        tenant_id: decoded.user.tenant_id,
        status: decoded.user.status,
        isActive: decoded.user.isActive,
        matriculationDate: decoded.user.matriculationDate
      }
    };

    const newToken = jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (err) {
    console.error('Token is not valid:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.checkTokenStatus = (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    res.json({ user: decoded.user });
  } catch (err) {
    console.error('Token is not valid:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
