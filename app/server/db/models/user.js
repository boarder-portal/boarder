const { isNull } = require('dwayne');
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
    getAvatar() {
      const { avatarId } = this;

      if (isNull(this.avatarId)) {
        return Promise.resolve(null);
      }

      return Attachment
        .findOne({
          where: {
            id: avatarId
          }
        })
        .then(({ url }) => url)
        .catch(() => null);
    },
    getSessionInfo() {
      return this.getAvatar()
        .then((avatar) => {
          this.avatar = avatar;

          return this;
        });
    }
  }
});

const toJSON = User.Instance.prototype.toJSON;

User.Instance.prototype.toJSON = function () {
  const json = toJSON.apply(this, arguments);

  json.avatar = this.avatar;

  delete json.password;

  return json;
};

module.exports = User;
