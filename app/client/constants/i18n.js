import $ from 'jquery';

import { parseJSON } from '../helpers/parse-json';
import I18n from '../../shared/i18n';

const i18n = new I18n(
  $(document.documentElement).attr('lang') || 'en',
  parseJSON(
    $(`<div>${window.boarderI18n || '{}'}</div>`).text()
  )
);

export { i18n };
