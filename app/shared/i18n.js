import _ from 'lodash';

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

  t(phrase) {
    const {
      cache: { phrases }
    } = this;

    if (phrases[phrase]) {
      return phrases[phrase];
    }

    const translation = _.reduce(phrase.split('.'), (translations, module) => (
      translations && translations[module]
    ), this.translations);

    /* eslint no-return-assign: 0 */
    return phrases[phrase] = _.isString(translation) ? translation : '';
  }
}

export default I18n;
