const path = require('path');
const glob = require('glob');
const pug = require('pug');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { assetsPath } = require('../../config/constants.json');
const viewsDir = path.resolve('./app/server/views');
const { NODE_ENV } = process.env;

module.exports = (app) => {
  app.use(assetsPath, express.static(path.resolve('./public')));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());

  if (NODE_ENV === 'production') {
    const templates = glob
      .sync('./app/server/views/**/*.pug')
      .reduce((templates, filename) => {
        const relativeName = path.relative(viewsDir, filename).replace(/.pug$/, '');

        templates[relativeName] = pug.compileFile(filename, {
          filename
        });

        return templates;
      }, {});

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
    res.render('index', {
      lang: 'en',
      allJS: `${ assetsPath }/js/all.js`,
      allCSS: `${ assetsPath }/css/all.css`,
      NODE_ENV: process.env.NODE_ENV
    });
  });
};
