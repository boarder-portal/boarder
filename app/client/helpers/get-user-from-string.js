import $ from 'jquery';

import { parseJSON } from './parse-json';

export function getUserFromString() {
  return parseJSON(
    $(`<div>${window.boarderUser || null}</div>`).text(),
    true
  );
}
