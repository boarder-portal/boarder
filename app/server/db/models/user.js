const Sequelize = require('sequelize');
const { hashPassword } = require('../../helpers');
const db = require('../');

const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  login: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true
    }
  },
  confirmed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  confirmToken: {
    type: Sequelize.STRING,
    field: 'confirm_token',
    defaultValue: null,
    allowNull: true
  },
  resetPasswordToken: {
    type: Sequelize.STRING,
    field: 'reset_password_token',
    defaultValue: null,
    allowNull: true
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
}, {
  hooks: {
    beforeBulkCreate(users) {
      users.forEach((user) => {
        user.password = hashPassword(user.password);
      });
    },
    beforeCreate(user) {
      user.password = hashPassword(user.password);
    }
  }
});

module.exports = User;
