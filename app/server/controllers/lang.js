import _ from 'lodash';

import { i18n } from '../helpers';

const languages = _.mapValues(i18n, () => true);

Reflect.setPrototypeOf(languages, null);

export async function change(ctx) {
  const {
    request: {
      body: { lang }
    },
    session
  } = ctx;

  if (!languages[lang]) {
    ctx.reject('NO_SUCH_LANGUAGE_SUPPORTED');
  }

  if (lang !== session.locale) {
    session.locale = lang;

    await session.savePr();
  }

  ctx.success();
}
