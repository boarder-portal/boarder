const sessionRequired = new Error('Session required');

module.exports = (req, res, next) => {
  if (!req.session) {
    return next(sessionRequired);
  }

  next();
};
