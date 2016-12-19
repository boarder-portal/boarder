const path = require('path');
const fs = require('fs-promise');
const Attachment = require('../db/models/attachment');
const { ASSETS_PATH } = require('../../config/constants.json');

const attachmentsDir = path.resolve('./public/attachments');

module.exports = {
  uploadAvatar(req, res, next) {
    const {
      file: {
        originalname,
        filename,
        path: filePath
      },
      user
    } = req;
    const ext = path.extname(originalname);
    let eventualFilename;

    Attachment
      .create({
        userId: user.id,
        type: 'avatar',
        filename,
        url: ''
      })
      .then((attachment) => {
        const { id } = attachment;

        eventualFilename = id + ext;

        attachment.filename = path.join(attachmentsDir, eventualFilename);
        attachment.url = `${ ASSETS_PATH }/attachments/${ eventualFilename }`;
        user.avatarId = id;

        return attachment.save();
      })
      .then((attachment) => (
        fs.move(filePath, attachment.filename)
          .then(() => attachment)
      ))
      .then((attachment) => res.json(attachment))
      .catch(next);
  },
  changeAvatar(req, res, next) {
    const {
      body: { avatarId },
      session,
      user
    } = req;

    if (!avatarId) {
      return next(new Error('Wrong avatar id'));
    }

    user.avatarId = avatarId;

    user
      .save()
      .then(() => (
        user.getSessionInfo()
      ))
      .then(() => {
        session.user = user;

        return session.savePr();
      })
      .then(() => res.json(true))
      .catch(next);
  },
  getAllAvatars(req, res, next) {
    const { user } = req;

    Attachment
      .findAll({
        where: {
          userId: user.id,
          type: 'avatar'
        }
      })
      .then((avatars) => (
        res.json(avatars)
      ))
      .catch(next);
  }
};
