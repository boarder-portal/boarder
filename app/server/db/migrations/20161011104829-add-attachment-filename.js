'use strict';

const TABLE_NAME = 'attachments';
const COLUMN_NAME = 'filename';

export async function up(queryInterface, Sequelize) {
  return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
    type: Sequelize.STRING,
    allowNull: false
  });
}

export async function down(queryInterface) {
  return queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
}
