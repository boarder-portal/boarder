import { doc, parseJSON } from 'dwayne';
import { store } from '../constants';

store.user = parseJSON(
  doc
    .div()
    .html(window.boarderUser || null)
    .text(),
  { dates: true }
).$;

console.log(store);
