const D = require('dwayne');
const i18n = require('../helpers/i18n');

const { self } = D;
const languages = D(i18n).map(self).$;

module.exports = {
  change(req, res) {
    const {
      body: { lang },
      session
    } = req;

    if (!languages[lang] || lang === session.locale) {
      return res.json(false);
    }

    session.locale = lang;

    res.json(true);
  }
};
