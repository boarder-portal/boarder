import { doc, html, parseJSON } from 'dwayne';
import I18n from './i18n';

const i18n = new I18n(
  html.attr('lang') || 'en',
  parseJSON(
    doc
      .div()
      .html(window.boarderI18n || {})
      .text()
  ).$
);

export default i18n;
