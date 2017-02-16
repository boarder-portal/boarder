import { doc, html } from 'dwayne';
import { parseJSON } from '../helpers/parseJSON';
import I18n from '../../shared/i18n';

const i18n = new I18n(
  html.attr('lang') || 'en',
  parseJSON(
    doc
      .div()
      .html(window.boarderI18n || '{}')
      .text()
  )
);

export { i18n };
