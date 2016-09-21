'use strict';

const TABLE_NAME = 'users';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(TABLE_NAME, {
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        allowNull: false
      }
    });
  },

  down(queryInterface) {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
