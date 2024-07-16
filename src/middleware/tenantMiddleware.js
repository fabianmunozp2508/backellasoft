// tenantMiddleware.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

async function getTenantIdFromSubdomain(subdomain) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    client.release();
    
    if (result.rows.length === 0) {
      return null; // Subdominio no encontrado
    }
    
    return result.rows[0].id;
  } catch (err) {
    console.error('Error fetching tenant ID:', err);
    return null;
  }
}

module.exports = async (req, res, next) => {
  const subdomain = req.subdomains[0];
  if (!subdomain) {
    return res.status(400).send('No tenant specified');
  }

  const tenantId = await getTenantIdFromSubdomain(subdomain);
  if (!tenantId) {
    return res.status(404).send('Tenant not found');
  }

  req.tenant_id = tenantId;
  next();
};
