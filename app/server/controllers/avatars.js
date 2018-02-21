import fs from 'fs-promise';

import Attachment from '../db/models/attachment';

export async function deleteOne(ctx) {
  const {
    query: { avatarId },
    session,
    user
  } = ctx;
  const avatar = await Attachment.findOne({
    where: {
      id: avatarId,
      userId: user.id,
      type: 'avatar'
    }
  });

  if (!avatar) {
    ctx.reject('WRONG_AVATAR_ID');
  }

  const destroyer = Promise.all([
    avatar.destroy(),
    fs.remove(avatar.filename)
  ]);

  if (session.user.avatar === avatar.url) {
    session.user.avatar = null;

    await Promise.all([
      session.savePr(),
      destroyer
    ]);
  } else {
    await destroyer;
  }

  ctx.success();
}
