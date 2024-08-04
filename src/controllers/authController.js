const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login request received with data:', { email, password });

  try {
    // Verificar si el usuario existe en PostgreSQL
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM public."Users" WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      client.release();
      console.log('User not registered');
      return res.status(400).json({ message: 'User not registered' });
    }

    const user = result.rows[0];
    console.log('User found in database:', user);

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

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
    console.log('User status found:', userStatus);

    // Consultar los datos de la institución
    const institutionResult = await client.query('SELECT * FROM public.institutions WHERE tenant_id = $1', [user.tenant_id]);

    if (institutionResult.rows.length === 0) {
      client.release();
      console.log('Institution not found');
      return res.status(404).json({ message: 'Institution not found' });
    }

    const institution = institutionResult.rows[0];
    console.log('Institution found:', institution);

    client.release();

    // Crear y enviar el token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        tenant_id: user.tenant_id, // Asignar tenant_id desde el usuario
        status: userStatus.status,
        isActive: userStatus.is_active_user,
        matriculationDate: userStatus.matriculation_date
      },
      institution
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('Error generating token:', err);
          throw err;
        }
        console.log('Token generated and sent to client:', token);
        res.json({ token, userStatus, institution }); // Enviar token, estado del usuario e institución
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
      },
      institution: decoded.institution
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
    res.json({ user: decoded.user, institution: decoded.institution });
  } catch (err) {
    console.error('Token is not valid:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.checkConnection = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1');
    client.release();

    if (result) {
      console.log('Database connection successful');
      res.status(200).json({ message: 'Database connection successful' });
    } else {
      console.log('Database connection failed');
      res.status(500).json({ message: 'Database connection failed' });
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({ message: 'Database connection error' });
  }
};
