const { Pool } = require('pg');
const config = require('config');
const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.getPreInscribedUserDetails = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prematriculados');
    const users = result.rows;

    res.json(users);
  } catch (err) {
    console.error('Error al obtener detalles de usuarios preinscritos:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
