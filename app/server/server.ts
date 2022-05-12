import 'regenerator-runtime/runtime';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import morgan from 'morgan';
import multer from 'multer';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

import { IUser } from 'common/types';

import app from 'server/expressApp';
import httpServer from 'server/httpServer';
import sessionSettings from 'server/sessionSettings';
import render from 'server/middlewares/render';
import apiRouter from 'server/api/apiRouter';

// @ts-ignore
import webpackConfig from '../../webpack/webpack.config.js';

import './gamesData';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve('./public/photos'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(webpackConfig);

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: '/build/web',
      writeToDisk(filePath) {
        return /build\/node\//.test(filePath) || /loadable-stats/.test(filePath);
      },
    }),
  );
}

app
  .use(expressSession(sessionSettings))
  .use('/build/web', express.static('build/web'))
  .use(express.static('public'))
  .use(morgan('dev'))
  .post(
    '/uploadPhoto',
    multer({ storage }).single('file'),
    (req, res) => {
      res.send(req.file);
    })
  .use('/api', apiRouter)
  .get('*', render);

httpServer.listen(2222, () => console.log('\nListening on port 2222...'));

declare module 'express-session' {
  interface SessionData {
    user?: IUser;
    destroy?(): void;
  }
}
