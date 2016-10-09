'use strict';

const TABLE_NAME = 'users';
const COLUMN_NAME = 'reset_password_token';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true
    });
  },

  down(queryInterface) {
    return queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
  }
};
