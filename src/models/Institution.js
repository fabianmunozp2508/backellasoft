const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db_postgres');

const Institution = sequelize.define('Institution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // Asegura que tenant_id sea único
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner_urls: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  rector_signature_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  coordinator_signatures: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  header_info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  official_website: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'institutions'
});

module.exports = Institution;
