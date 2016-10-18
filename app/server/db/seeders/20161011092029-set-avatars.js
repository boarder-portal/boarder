'use strict';

const User = require('../models/user');
const Attachment = require('../models/attachment');

module.exports = {
  up() {
    return User.findAll({})
      .then((users) => (
        Promise
          .all(
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
          )
      ))
      .then((users) => (
        Promise.all(
          users.map(([user, { id }]) => {
            user.avatarId = id;

            return user.save();
          })
        )
      ));
  },

  down() {
    return User.findAll({})
      .then((users) => (
        Promise.all(
          users.map((user) => {
            user.avatarId = null;

            return user.save();
          })
        )
      ));
  }
};
