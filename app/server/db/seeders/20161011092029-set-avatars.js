'use strict';

import User from '../models/user';
import Attachment from '../models/attachment';

export async function up() {
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
}

export async function down() {
  const users = await User.findAll({});

  return Promise.all(
    users.map((user) => {
      user.avatarId = null;

      return user.save();
    })
  );
}
