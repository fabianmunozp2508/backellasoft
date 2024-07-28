const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/db_postgres');

const UserInstitutionalStatus = sequelize.define('UserInstitutionalStatus', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  is_active_user: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  matriculation_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Matriculado'
  },
  update_user_institutional_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'user_institutional_status',
  timestamps: false
});

module.exports = UserInstitutionalStatus;
