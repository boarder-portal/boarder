const Sequelize = require('sequelize');
const db = require('../');

const Attachment = db.define('attachment', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
    field: 'user_id',
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false
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

module.exports = Attachment;
