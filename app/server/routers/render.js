const { templates } = require('../helpers');
const method = require('../controllers/method');
const { ASSETS_PATH } = require('../../config/constants.json');

const INDEX_TMPL = templates.index;

module.exports = (app) => {
  app.use(method('get', async (ctx) => {
    const {
      i18n: { locale },
      session: {
        user = null
      } = {}
    } = ctx;

    ctx.type = 'html';
    ctx.body = INDEX_TMPL({
      lang: locale,
      allJS: `${ ASSETS_PATH }/js/all.js`,
      allCSS: `${ ASSETS_PATH }/css/all.css`,
      i18n: `${ ASSETS_PATH }/i18n/${ locale }.js`,
      user: JSON.stringify(user),
      NODE_ENV: process.env.NODE_ENV
    });
  }));
};
