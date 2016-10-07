const accept = require('express-request-language');
const { i18n } = require('../helpers');
const languages = Object.keys(i18n);

module.exports = (app) => {
  app.use(accept({
    languages
  }));
  app.use((req, res, next) => {
    const {
      language,
      session
    } = req;
    let { locale } = session;

    if (!session.locale) {
      locale = session.locale = language || 'en';
      session.save();
    }

    req.i18n = i18n[locale];

    next();
  });
};
