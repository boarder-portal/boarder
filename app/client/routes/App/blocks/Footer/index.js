import _ from 'lodash';
import { Block, html } from 'dwayne';
import Promise from 'el-promise';
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
  currentLang = _.find(this.languages, ({ lang }) => lang === i18n.locale);

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

Block.block('MainFooter', MainFooter);
