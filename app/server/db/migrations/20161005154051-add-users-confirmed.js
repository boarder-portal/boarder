'use strict';

const TABLE_NAME = 'users';

export async function up(queryInterface, Sequelize) {
  return Promise.all([
    queryInterface.addColumn(TABLE_NAME, 'confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }),
    queryInterface.addColumn(TABLE_NAME, 'confirm_token', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true
    })
  ]);
}

export async function down(queryInterface) {
  return Promise.all([
    queryInterface.removeColumn(TABLE_NAME, 'confirmed'),
    queryInterface.removeColumn(TABLE_NAME, 'confirm_token')
  ]);
}
