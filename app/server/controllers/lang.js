const _ = require('lodash');
const { i18n } = require('../helpers');

const languages = _.mapValues(i18n, () => true);

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
