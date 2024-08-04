'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'mongoUserId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true // Asegura que sea único
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'mongoUserId');
  }
};
