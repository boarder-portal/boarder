import 'regenerator-runtime/runtime';
import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import morgan from 'morgan';
import multer from 'multer';

import { IUser } from 'common/types';

import app from 'server/expressApp';
import httpServer from 'server/httpServer';
import sessionSettings from 'server/sessionSettings';
import render from 'server/middlewares/render';
import apiRouter from 'server/api/apiRouter';

import './gamesData';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve('./public/photos'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

app
  .use(expressSession(sessionSettings))
  .set('view engine', 'pug')
  .set('views', path.join(__dirname, 'views'))
  .use(morgan('dev'))
  .use(express.static('build/client'))
  .use(express.static('public'))
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
