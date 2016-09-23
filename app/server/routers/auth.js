const { auth } = require('../controllers/auth');

module.exports = (app) => {
  app.use(auth);
};
