import { D, Block, Promise, html } from 'dwayne';
import template from './index.pug';
import { i18n } from '../../../../i18n';

let fetch = Promise.resolve();

class MainFooter extends Block {
  static template = template();

  languages = [
    {
      lang: 'en',
      flag: 'gb',
      caption: 'English'
    },
    {
      lang: 'ru',
      flag: 'ru',
      caption: 'Русский'
    }
  ];
  currentLang = D(this.languages).find(({ lang }) => lang === i18n.locale).value;

  chooseLang(lang) {
    fetch.abort();

    if (lang === html.attr('lang')) {
      return;
    }

    fetch = this.global.langFetch.change({
      data: { lang }
    });

    fetch
      .then(({ json }) => {
        if (!json) {
          return;
        }

        location.reload();
      });
  }
}

Block.register('MainFooter', MainFooter);
