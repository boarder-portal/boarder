const User = require('../db/models/user');

const notAuthorizedError = new Error('Not authorized');

module.exports = (req, res, next) => {
  const { user } = req.session;

  if (!user) {
    return next(notAuthorizedError);
  }

  User
    .findOne({
      where: {
        email: user.email
      }
    })
    .then((user) => {
      if (!user) {
        throw notAuthorizedError;
      }

      req.user = user;

      return next();
    })
    .catch(next);
};
