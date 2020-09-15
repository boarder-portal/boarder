import path from 'path';
import express from 'express';
import redis from 'redis';
import connectRedis from 'connect-redis';
import expressSession from 'express-session';
import morgan from 'morgan';
import multer from 'multer';

import apolloServer from 'server/apolloServer';
import app from 'server/expressApp';
import httpServer from 'server/httpServer';

import './gamesData';

const SESSION_ALIVE_TIME_MS = 3 * 30 * 24 * 60 * 60 * 1000;

const redisStore = connectRedis(expressSession);
const redisClient = redis.createClient();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve('./public/photos'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

app
  .use(expressSession({
    secret: 'secrettttt',
    cookie: {
      maxAge: SESSION_ALIVE_TIME_MS,
    },
    store: new redisStore({
      client: redisClient,
      prefix: 'boarder',
    }),
  }))
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
