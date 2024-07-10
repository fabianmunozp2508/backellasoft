// src/config/db_postgres.js
const { Sequelize } = require('sequelize');
const config = require('config');

const db = config.get('postgresURI');

const sequelize = new Sequelize(db, {
  dialect: 'postgres',
  logging: false, // O true si quieres ver los logs SQL
});

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL...'))
  .catch(err => console.error('Error connecting to PostgreSQL:', err));

module.exports = sequelize;
