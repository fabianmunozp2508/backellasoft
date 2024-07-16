// src/middleware/tenantMiddleware.js
const { Pool } = require('pg');
const config = require('config');

const pool = new Pool({ connectionString: config.get('postgresURI') });

const tenantMiddleware = async (req, res, next) => {
  const subdomain = req.subdomains[0];
  if (!subdomain) {
    return res.status(400).send('No tenant specified');
  }

  try {
    const tenantId = await getTenantIdFromSubdomain(subdomain);
    if (!tenantId) {
      return res.status(400).send('Invalid tenant specified');
    }

    // Asigna el tenant_id basado en el subdominio
    req.tenant_id = tenantId;
    next();
  } catch (error) {
    console.error('Error fetching tenant ID:', error);
    res.status(500).send('Server error');
  }
};

const getTenantIdFromSubdomain = async (subdomain) => {
  try {
    const result = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error querying tenant ID from subdomain:', error);
    throw error;
  }
};

module.exports = tenantMiddleware;
