import util from 'util';
import Accept from 'express-request-language';

import { i18n } from '../helpers';

const accept = util.promisify(Accept({
  languages: Object.keys(i18n)
}));

export default (app) => {
  app.use(async (ctx, next) => {
    await accept(ctx.request, ctx.response);

    const {
      request: {
        language
      },
      session
    } = ctx;
    let { locale } = session;

    if (!locale) {
      locale = language || 'en';

      if (session) {
        session.locale = locale;

        await session.savePr();
      }
    }

    ctx.i18n = i18n[locale];

    await next();
  });
};
