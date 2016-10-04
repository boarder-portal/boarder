import { doc, html, parseJSON } from 'dwayne';
import I18n from '../../shared/i18n';

let i18n;

setLanguage(html.attr('lang') || 'en');

function setLanguage(lang) {
  i18n = new I18n(
    lang,
    parseJSON(
      doc
        .div()
        .html(window.boarderI18n || '{}')
        .text()
    ).$
  );
}

function changeLanguage(lang) {
  // TODO: ajax request goes here
}

export { i18n, changeLanguage };
