'use strict';

const TABLE_NAME = 'users';
const COLUMN_NAME = 'reset_password_token';

export async function up(queryInterface, Sequelize) {
  return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
    type: Sequelize.STRING,
    defaultValue: null,
    allowNull: true
  });
}

export async function down(queryInterface) {
  return queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
}
