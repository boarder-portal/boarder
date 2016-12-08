import { parseJSON, doc } from 'dwayne';

export function getUserFromString() {
  return parseJSON(
    doc
      .div()
      .html(window.boarderUser || null)
      .text(),
    { dates: true }
  ).$;
}
