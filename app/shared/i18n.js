const D = require('dwayne');

const { isArray, isString, array } = D;
const cache = {};

class I18n {
  constructor(locale, translations) {
    this.cache = cache[locale] = cache[locale] || {
      phrases: {},
      sets: {}
    };
    this.locale = locale;
    this.translations = translations;
  }

  ta(phrase, length) {
    const {
      cache: { sets }
    } = this;

    if (sets[phrase]) {
      return sets[phrase];
    }

    const modules = phrase.split('.');
    let translations = modules.reduce((translations, module) => (
      translations && translations[module]
    ), this.translations);

    if (!isArray(translations)) {
      translations = [];
    }

    /* eslint no-return-assign: 0 */
    return sets[phrase] = array(length, (i) => translations[i] || '').$;
  }

  tc(phrase) {
    return D(this.t(phrase)).capitilizeFirst();
  }

  tl(phrase) {
    return D(this.t(phrase)).toLowerCase();
  }

  t(phrase) {
    const {
      cache: { phrases }
    } = this;

    if (phrases[phrase]) {
      return phrases[phrase];
    }

    const modules = phrase.split('.');
    const translation = modules.reduce((translations, module) => (
      translations && translations[module]
    ), this.translations);

    /* eslint no-return-assign: 0 */
    return phrases[phrase] = isString(translation) ? translation : '';
  }
}

module.exports = I18n;
