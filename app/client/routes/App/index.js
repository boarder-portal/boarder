import { D, Block, wrap, makeRoute } from 'dwayne';
import { includeGlobals } from '../../helper';
import { i18n, changeLanguage } from '../../i18n';
import template from './index.pug';

class App extends Block {
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
    changeLanguage(lang);
  }
}

Block.App = wrap(App, [
  makeRoute({
    name: 'root',
    root: true
  }),
  includeGlobals
]);
