const { promisify } = require('util');
const Accept = require('express-request-language');

const { i18n } = require('../helpers');

const accept = promisify(Accept({
  languages: Object.keys(i18n)
}));

module.exports = (app) => {
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
