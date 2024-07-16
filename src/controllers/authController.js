const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe en PostgreSQL
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM public."Users" WHERE email = $1', [email]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not registered' });
    }

    const user = result.rows[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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
        role: decoded.user.role
      }
    };

    const newToken = jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (err) {
    console.error('Token is not valid:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
