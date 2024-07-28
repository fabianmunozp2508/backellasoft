// src/middleware/tenantMiddleware.js
const { Pool } = require('pg');
const config = require('config');
const db = config.get('postgresURI');
const pool = new Pool({ connectionString: db });

async function getTenantIdFromSubdomain(subdomain) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    client.release();
    
    if (result.rows.length === 0) {
      console.log(`No tenant found for subdomain: ${subdomain}`);
      return null; // Subdominio no encontrado
    }
    
    console.log(`Tenant ID for subdomain ${subdomain}: ${result.rows[0].id}`);
    return result.rows[0].id;
  } catch (err) {
    console.error('Error fetching tenant ID:', err);
    return null;
  }
}

module.exports = async (req, res, next) => {
  const host = req.headers.host.split(':')[0];
  const subdomain = host === 'localhost' ? 'cliente1' : host.split('.')[0]; // Asumiendo cliente1 como subdominio por defecto para localhost
  console.log('Host:', host);
  console.log('Subdomain:', subdomain);

  if (!subdomain) {
    console.log('No subdomain specified');
    return res.status(400).send('No tenant specified');
  }

  const tenantId = await getTenantIdFromSubdomain(subdomain);
  console.log('Tenant ID:', tenantId);
  if (!tenantId) {
    console.log('No tenant found for subdomain:', subdomain);
    return res.status(404).send('Tenant not found');
  }

  req.tenant_id = tenantId;
  console.log('req.tenant_id:', req.tenant_id); // Verificar que el tenant_id está siendo asignado
  next();
};
