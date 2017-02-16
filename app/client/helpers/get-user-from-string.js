import { doc } from 'dwayne';
import { parseJSON } from './parseJSON';

export function getUserFromString() {
  return parseJSON(
    doc
      .div()
      .html(window.boarderUser || null)
      .text(),
    true
  );
}
