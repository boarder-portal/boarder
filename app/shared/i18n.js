const { isString } = require('dwayne');

class I18n {
  constructor(locale, translations) {
    this.cache = {};
    this.locale = locale;
    this.translations = translations;
  }

  t(phrase) {
    const { cache } = this;

    if (cache[phrase]) {
      return cache[phrase];
    }

    const modules = phrase.split('.');
    const translation = modules.reduce((translations, module) => (
      translations && translations[module]
    ), this.translations);

    /* eslint no-return-assign: 0 */
    return cache[phrase] = isString(translation) ? translation : '';
  }
}

module.exports = I18n;
