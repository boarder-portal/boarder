import { Promise, doc, html, parseJSON } from 'dwayne';
import I18n from '../../shared/i18n';
import { langFetch } from '../fetchers';

let i18n;
let fetch = Promise.resolve();

setLanguage();

function setLanguage() {
  i18n = new I18n(
    html.attr('lang') || 'en',
    parseJSON(
      doc
        .div()
        .html(window.boarderI18n || '{}')
        .text()
    ).$
  );
}

function changeLanguage(lang) {
  fetch.abort();

  if (lang === html.attr('lang')) {
    return;
  }

  fetch = langFetch.change({
    data: { lang }
  });

  fetch
    .then(({ json }) => {
      if (!json) {
        return;
      }

      location.reload();
    })
    .catch(({ res, message }) => {
      if (message !== 'Request was aborted') {
        console.log(res);
      }
    });
}

export { i18n, changeLanguage };
