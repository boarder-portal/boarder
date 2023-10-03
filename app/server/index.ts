import 'regenerator-runtime/runtime';
import 'server/utilities/importEnv';

import path from 'node:path';

import connect from 'koa-connect';
import mount from 'koa-mount';
import serve from 'koa-static';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

import { client as redisClient } from 'server/utilities/redis';

import api from 'server/api';
import { migrate } from 'server/db/migrations/migrator';
import UserModel from 'server/db/models/user';
import render from 'server/middlewares/render';
import { session } from 'server/middlewares/session';
import { app, server } from 'server/server';

import webpackConfig from '../../webpack/webpack.config';

import './gamesData';

const PORT = Number(process.env.PORT);

app.use(
  mount(
    '/public',
    serve(path.resolve('./public'), {
      gzip: true,
    }),
  ),
);
app.use(
  mount(
    '/build/web',
    serve(path.resolve('./build/web'), {
      gzip: true,
    }),
  ),
);

if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(webpackConfig);

  app.use(
    connect(
      webpackDevMiddleware(compiler, {
        publicPath: '/build/web',
        writeToDisk: true,
      }),
    ),
  );
}

app.use(session);
app.use(async (ctx, next) => {
  const userId = ctx.state.session.userId;

  ctx.state.user = userId ? (await UserModel.findById(userId))?.toData() ?? null : null;

  await next();
});
app.use(api.routes());
app.use(api.allowedMethods());
app.use(render);

(async () => {
  await Promise.all([redisClient.connect(), migrate()]);

  await new Promise<void>((resolve) => {
    server.listen(PORT, resolve);
  });

  console.log(`Listening on http://localhost:${PORT}...`);
})().catch((err) => {
  console.log(err);

  process.exit(1);
});
