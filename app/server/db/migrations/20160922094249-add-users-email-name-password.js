'use strict';

const TABLE_NAME = 'users';

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(TABLE_NAME, 'id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      }),
      queryInterface.addColumn(TABLE_NAME, 'login', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }),
      queryInterface.addColumn(TABLE_NAME, 'email', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }),
      queryInterface.addColumn(TABLE_NAME, 'password', {
        type: Sequelize.STRING
      })
    ]);
  },

  down(queryInterface) {
    return Promise.all([
      queryInterface.removeColumn(TABLE_NAME, 'id'),
      queryInterface.removeColumn(TABLE_NAME, 'login'),
      queryInterface.removeColumn(TABLE_NAME, 'email'),
      queryInterface.removeColumn(TABLE_NAME, 'password')
    ]);
  }
};
