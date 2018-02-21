import path from 'path';
import fs from 'fs-promise';

import Attachment from '../db/models/attachment';
import { ASSETS_PATH } from '../../shared/constants';

const ATTACHMENTS_DIR = path.resolve('./public/attachments');

export async function uploadAvatar(ctx) {
  const {
    req: {
      file: {
        originalname,
        filename,
        path: filePath
      }
    },
    user
  } = ctx;
  const ext = path.extname(originalname);
  const attachment = await Attachment.create({
    userId: user.id,
    type: 'avatar',
    filename,
    url: ''
  });
  const { id } = attachment;
  const eventualFilename = id + ext;
  const absoluteFilename = path.join(ATTACHMENTS_DIR, eventualFilename);

  attachment.filename = absoluteFilename;
  attachment.url = `${ASSETS_PATH}/attachments/${eventualFilename}`;

  await Promise.all([
    attachment.save(),
    fs.move(filePath, absoluteFilename)
  ]);

  ctx.json(attachment);
}

export async function changeAvatar(ctx) {
  const {
    request: {
      body: { avatarId }
    },
    session,
    user
  } = ctx;

  if (!avatarId) {
    ctx.reject('WRONG_AVATAR_ID');
  }

  user.avatarId = avatarId;

  await user.save();
  await user.getSessionInfo();

  session.user = user;

  await session.savePr();

  ctx.success();
}

export async function getAllAvatars(ctx) {
  const { user } = ctx;
  const avatars = await Attachment.findAll({
    where: {
      userId: user.id,
      type: 'avatar'
    }
  });

  ctx.json(avatars);
}
