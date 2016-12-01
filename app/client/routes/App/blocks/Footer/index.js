import { D, Block } from 'dwayne';
import { i18n, changeLanguage } from '../../../../i18n';
import template from './index.pug';

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
  chooseLang = changeLanguage;
}

Block.MainFooter = MainFooter;
