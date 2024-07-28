const { Pool } = require('pg');
const config = require('config');
const pool = new Pool({ connectionString: config.get('postgresURI') });

exports.createUserStatus = async (req, res) => {
  const { userId, isActiveUser, matriculationDate, rol, status } = req.body;
  const tenantId = req.tenant_id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO public.user_institutional_status (user_id, tenant_id, is_active_user, matriculation_date, rol, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, tenantId, isActiveUser, matriculationDate, rol, status]
    );
    client.release();

    res.status(201).json({ userStatus: result.rows[0] });
  } catch (err) {
    console.error('Error creating user status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserStatus = async (req, res) => {
  const { userId } = req.params;
  const tenantId = req.tenant_id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM public.user_institutional_status WHERE user_id = $1 AND tenant_id = $2',
      [userId, tenantId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User status not found' });
    }

    res.status(200).json({ userStatus: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActiveUser, matriculationDate, rol, status } = req.body;
  const tenantId = req.tenant_id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE public.user_institutional_status SET is_active_user = $1, matriculation_date = $2, rol = $3, status = $4 WHERE user_id = $5 AND tenant_id = $6 RETURNING *',
      [isActiveUser, matriculationDate, rol, status, userId, tenantId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User status not found' });
    }

    res.status(200).json({ userStatus: result.rows[0] });
  } catch (err) {
    console.error('Error updating user status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUserStatus = async (req, res) => {
  const { userId } = req.params;
  const tenantId = req.tenant_id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'DELETE FROM public.user_institutional_status WHERE user_id = $1 AND tenant_id = $2 RETURNING *',
      [userId, tenantId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User status not found' });
    }

    res.status(200).json({ message: 'User status deleted' });
  } catch (err) {
    console.error('Error deleting user status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
