const _ = require('lodash');
const Sequelize = require('sequelize');
const Attachment = require('./attachment');
const hashPassword = require('../../helpers/hash-password');
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
  avatarId: {
    type: Sequelize.INTEGER,
    field: 'avatar_id',
    defaultValue: null,
    allowNull: true,
    references: {
      model: 'attachments',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'set default'
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
  },
  instanceMethods: {
    async getAvatar() {
      const { avatarId } = this;

      if (_.isNull(avatarId)) {
        return Promise.resolve(null);
      }

      const { url } = await Attachment.findOne({
        where: {
          id: avatarId
        }
      });

      return url;
    },
    async getSessionInfo() {
      this.avatar = await this.getAvatar();

      return this;
    }
  }
});

const { toJSON } = User.Instance.prototype;

User.Instance.prototype.toJSON = function (...args) {
  const json = this::toJSON(...args);

  json.avatar = this.avatar;

  delete json.password;

  return json;
};

module.exports = User;
