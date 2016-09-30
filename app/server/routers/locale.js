const i18n = require('../helpers/i18n');

module.exports = (app) => {
  app.use((req, res, next) => {
    const {
      headers: {
        'accept-language': lang
      },
      session
    } = req;
    let { locale } = session;

    if (!i18n[locale]) {
      locale = session.locale = 'en';
      session.save();
    }

    console.log(lang);

    req.locale = locale;
    req.i18n = i18n[locale];

    next();
  });
};
