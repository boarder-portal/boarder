import { Promise, doc, body, html, parseJSON, reload } from 'dwayne';
import BaseState from '../routers/base';
import I18n from '../../shared/i18n';
import { langFetch } from '../fetchers';
import { ASSETS_PATH } from '../../config/constants.json';

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
      if (json) {
        const script = doc.script();

        script.on('load', () => {
          script.remove();
          setLanguage();

          BaseState.templateParams.i18n = i18n;

          reload();
        });

        script
          .ref(`${ ASSETS_PATH }/i18n/${ lang }.js`)
          .into(body);
        html.attr('lang', lang);
      }
    })
    .catch(({ res, message }) => {
      if (message !== 'Request was aborted') {
        console.log(res);
      }
    });
}

export { i18n, changeLanguage };
