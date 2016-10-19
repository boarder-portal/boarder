'use strict';

const path = require('path');
const fs = require('fs-promise');
const http = require('http');

const User = require('../models/user');
const Attachment = require('../models/attachment');
const { defaultAvatar } = require('../../../config/config.json');
const { ASSETS_PATH } = require('../../../config/constants.json');

const TABLE_NAME = 'attachments';
const ATTACHMENTS_DIR = path.resolve('./public/attachments');

module.exports = {
  up() {
    return fs.ensureDir(`${ ATTACHMENTS_DIR }`)
      .then(() => User.findAll({}))
      .then((users) => (
        Promise
          .all(
            users.map(({ id }) => (
              Attachment.create({
                userId: id,
                type: 'avatar',
                filename: '',
                url: ''
              })
            ))
          )
      ))
      .then((attachments) => (
        new Promise((resolve) => {
          const req = http.get(defaultAvatar, (res) => {
            Promise
              .all(
                attachments.map((attachment) => {
                  const filename = `${ ATTACHMENTS_DIR }/${ attachment.id }.png`;

                  return Promise.all([
                    attachment.update({
                      filename,
                      url: `${ ASSETS_PATH }/attachments/${ attachment.id }.png`
                    }),
                    new Promise((resolve) => {
                      const stream = fs.createWriteStream(filename);

                      res.pipe(stream);

                      stream.on('finish', resolve);
                    })
                  ]);
                })
              )
              .then(() => req.abort())
              .then(resolve);
          });
        })
      ));
  },

  down(queryInterface) {
    return Promise.all([
      fs.remove(ATTACHMENTS_DIR),
      queryInterface.bulkDelete(TABLE_NAME, null, {})
    ]);
  }
};
