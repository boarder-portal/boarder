import Sequelize from 'sequelize';

import db from '../';

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
  url: {
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

const toJSON = Attachment.Instance.prototype.toJSON;

Attachment.Instance.prototype.toJSON = function () {
  const json = toJSON.apply(this, arguments);

  delete json.filename;

  return json;
};

export default Attachment;
