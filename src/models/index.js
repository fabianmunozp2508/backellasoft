const sequelize = require('../../config/db_postgres');

const Institution = require('./Institution');
const User = require('./User');

// Establecer relaciones
Institution.hasMany(User, {
  foreignKey: 'tenant_id',
  sourceKey: 'tenant_id',
  as: 'users'
});

User.belongsTo(Institution, {
  foreignKey: 'tenant_id',
  targetKey: 'tenant_id',
  as: 'institution'
});

module.exports = {
  Institution,
  User,
  sequelize
};
