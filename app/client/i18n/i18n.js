import { isString } from 'dwayne';

class I18n {
  constructor(locale, translations) {
    this.locale = locale;
    this.translations = translations;
  }

  t(phrase) {
    const modules = phrase.split('.');
    const translation =  modules.reduce((translations, module) => (
      translations && translations[module]
    ), this.translations);

    return isString(translation) ? translation : '';
  }
}

export default I18n;
