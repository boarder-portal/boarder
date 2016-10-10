const path = require('path');
const { templates } = require('../helpers');
const { ASSETS_PATH } = require('../../config/constants.json');

const viewsDir = path.resolve('./app/server/views');
const { NODE_ENV } = process.env;

module.exports = (app) => {
  if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
      res.render = (filename, locals) => {
        res.send(templates[filename](locals));
      };

      next();
    });
  } else if (NODE_ENV === 'development') {
    app.set('view engine', 'pug');
    app.set('views', viewsDir);
  }

  app.use(/.*/, (req, res) => {
    const {
      i18n: { locale },
      session: {
        user = null
      } = {}
    } = req;

    res.render('index', {
      lang: locale,
      allJS: `${ ASSETS_PATH }/js/all.js`,
      allCSS: `${ ASSETS_PATH }/css/all.css`,
      i18n: `${ ASSETS_PATH }/i18n/${ locale }.js`,
      user: JSON.stringify(user),
      NODE_ENV: process.env.NODE_ENV
    });
  });
};
