'use strict';

const TABLE_NAME = 'users';

export async function up(queryInterface, Sequelize) {
  return queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
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
}

export async function down(queryInterface) {
  return queryInterface.dropTable(TABLE_NAME);
}
