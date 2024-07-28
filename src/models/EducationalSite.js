const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/db_postgres');

const EducationalSite = sequelize.define('EducationalSite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'institutions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'educational_sites'
});

module.exports = EducationalSite;
