import path from 'node:path';

import compose from 'koa-compose';
import mount from 'koa-mount';
import koaServe from 'koa-static';

import { Middleware } from 'server/types/koa';

import notFound from 'server/middlewares/notFound';

const serve = (pathname: string, location = path.resolve(`.${pathname}`)): Middleware =>
  mount(
    pathname,
    compose([
      koaServe(location, {
        gzip: true,
      }),
      notFound,
    ]),
  );

export default serve;
