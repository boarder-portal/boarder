'use strict';

import path from 'path';
import fs from 'fs-promise';
import http from 'http';

import User from '../models/user';
import Attachment from '../models/attachment';
import config from '../../config';
import { ASSETS_PATH } from '../../../shared/constants';

const TABLE_NAME = 'attachments';
const ATTACHMENTS_DIR = path.resolve('./public/attachments');

export async function up() {
  await fs.ensureDir(`${ATTACHMENTS_DIR}`);

  const users = await User.findAll({});
  const attachments = await Promise.all(
    users.map(({ id }) => (
      Attachment.create({
        userId: id,
        type: 'avatar',
        filename: '',
        url: ''
      })
    ))
  );

  return new Promise((resolve) => {
    const req = http.get(config.defaultAvatar, async (res) => {
      await Promise.all(
        attachments.map((attachment) => {
          const filename = `${ATTACHMENTS_DIR}/${attachment.id}.png`;

          return Promise.all([
            attachment.update({
              filename,
              url: `${ASSETS_PATH}/attachments/${attachment.id}.png`
            }),
            new Promise((resolve) => {
              const stream = fs.createWriteStream(filename);

              res.pipe(stream);

              stream.on('finish', resolve);
            })
          ]);
        })
      );

      req.abort();

      resolve();
    });
  });
}

export async function down(queryInterface) {
  return Promise.all([
    fs.remove(ATTACHMENTS_DIR),
    queryInterface.bulkDelete(TABLE_NAME, null, {})
  ]);
}
