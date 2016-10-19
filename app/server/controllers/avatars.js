const fs = require('fs-promise');
const Attachment = require('../db/models/attachment');

module.exports = {
  delete(req, res, next) {
    const {
      query: { avatarId },
      session,
      user
    } = req;

    Attachment
      .findOne({
        where: {
          id: avatarId,
          userId: user.id,
          type: 'avatar'
        }
      })
      .then((avatar) => {
        if (!avatar) {
          return false;
        }

        const destroyer = avatar
          .destroy()
          .then(() => (
            fs.remove(avatar.filename)
          ));

        if (session.user.avatar !== avatar.url) {
          return destroyer;
        }

        session.user.avatar = null;

        return Promise.all([
          session.savePr(),
          destroyer
        ]);
      })
      .then((avatar) => {
        res.json(!!avatar);
      })
      .catch(next);
  }
};
