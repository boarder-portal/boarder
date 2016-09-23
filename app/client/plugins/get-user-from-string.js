import { doc } from 'dwayne';
import { store } from '../constants';

store.user = JSON.parse(
  doc
    .div()
    .html(window.boarderUser || null)
    .text()
);

console.log(store);
