'use strict';

const TABLE_NAME = 'users';

export async function up(queryInterface, Sequelize) {
  return Promise.all([
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
}

export async function down(queryInterface) {
  return Promise.all([
    queryInterface.removeColumn(TABLE_NAME, 'login'),
    queryInterface.removeColumn(TABLE_NAME, 'email'),
    queryInterface.removeColumn(TABLE_NAME, 'password')
  ]);
}
