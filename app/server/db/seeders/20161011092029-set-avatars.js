'use strict';

const User = require('../models/user');
const Attachment = require('../models/attachment');

module.exports = {
  async up() {
    const users = await User.findAll({});
    const avatarsAndUsers = await Promise.all(
      users.map((user) => (
        Promise.all([
          user,
          Attachment.findOne({
            where: {
              userId: user.id,
              type: 'avatar'
            }
          })
        ])
      ))
    );

    return Promise.all(
      avatarsAndUsers.map(([user, { id }]) => {
        user.avatarId = id;

        return user.save();
      })
    );
  },

  async down() {
    const users = await User.findAll({});

    return Promise.all(
      users.map((user) => {
        user.avatarId = null;

        return user.save();
      })
    );
  }
};
