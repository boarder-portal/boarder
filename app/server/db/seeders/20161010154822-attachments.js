'use strict';

const path = require('path');
const fs = require('fs-promise');
const http = require('http');

const User = require('../models/user');
const Attachment = require('../models/attachment');
const { defaultAvatar } = require('../../../config/config.json');

const TABLE_NAME = 'attachments';
const ATTACHMENTS_DIR = path.resolve('./public/attachments');

module.exports = {
  up() {
    return User.findAll({})
      .then((users) => (
        Promise
          .all(
            users.map(({ id }) => (
              fs.ensureDir(`${ ATTACHMENTS_DIR }/users/${ id }`)
                .then(() => Attachment.create({ userId: id }))
            ))
          )
          .then((attachments) => (
            new Promise((resolve) => {
              http.get(defaultAvatar, (res) => {
                Promise
                  .all(
                    attachments.map(({ id, userId }) => (
                      new Promise((resolve) => {
                        const stream = fs.createWriteStream(`${ ATTACHMENTS_DIR }/users/${ userId }/${ id }.png`);

                        res.pipe(stream);

                        stream.on('end', resolve);
                      })
                    ))
                  )
                  .then(resolve);
              });
            })
          ))
      ));
  },

  down(queryInterface) {
    return Promise.all([
      fs.remove(ATTACHMENTS_DIR),
      queryInterface.bulkDelete(TABLE_NAME, null, {})
    ]);
  }
};
