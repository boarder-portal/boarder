const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { assetsPath } = require('../../config/config.json');

module.exports = (app) => {
  app.set('view engine', 'pug');
  app.set('views', path.resolve('./app/server/views'));

  app.use('/public', express.static(path.resolve('./public')));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use(/.*/, (req, res) => {
    console.log(req.headers['accept-language']);

    res.render('index', {
      lang: 'en',
      allJS: `${ assetsPath }/js/all.js`,
      NODE_ENV: process.env.NODE_ENV
    });
  });
};
