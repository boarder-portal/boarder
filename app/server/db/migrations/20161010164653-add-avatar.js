'use strict';

const TABLE_NAME = 'users';
const COLUMN_NAME = 'avatar_id';

export async function up(queryInterface, Sequelize) {
  return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
    type: Sequelize.INTEGER,
    defaultValue: null,
    allowNull: true,
    references: {
      model: 'attachments',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'set default'
  });
}

export async function down(queryInterface) {
  return queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
}
