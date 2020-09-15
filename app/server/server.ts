import path from 'path';
import express from 'express';
import expressSession from 'express-session';
import morgan from 'morgan';
import multer from 'multer';

import apolloServer from 'server/apolloServer';
import app from 'server/expressApp';
import httpServer from 'server/httpServer';
import sessionSettings from 'server/sessionSettings';

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
  .use(express.static('build'))
  .use(express.static('public'))
  .post(
    '/uploadPhoto',
    multer({ storage }).single('file'),
    (req, res) => {
      res.send(req.file);
    })
  .get('*', (req, res) => {
    res.render('index');
  });

apolloServer.applyMiddleware({ app });

httpServer.listen(2222, () => console.log('\nListening on port 2222...'));
