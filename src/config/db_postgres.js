const { Pool } = require('pg');
const config = require('config');
const db = config.get('postgresURI');

const connectPostgres = async () => {
  const pool = new Pool({
    connectionString: db
  });

  pool.on('connect', () => {
    console.log('Connected to PostgreSQL...');
  });

  pool.on('error', (err) => {
    console.error('Error connecting to PostgreSQL:', err);
  });

  try {
    await pool.connect();
    console.log('Successfully connected to PostgreSQL');
  } catch (err) {
    console.error('Connection to PostgreSQL failed', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      internalPosition: err.internalPosition,
      internalQuery: err.internalQuery,
      where: err.where,
      schema: err.schema,
      table: err.table,
      column: err.column,
      dataType: err.dataType,
      constraint: err.constraint
    });
  }

  return pool;
};

module.exports = connectPostgres;
