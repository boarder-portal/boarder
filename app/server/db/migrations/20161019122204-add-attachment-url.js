'use strict';

const TABLE_NAME = 'attachments';
const COLUMN_NAME = 'url';

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down(queryInterface) {
    return queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
  }
};
