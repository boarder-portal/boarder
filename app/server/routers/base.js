import path from 'path';
import serve from 'koa-static';
import mount from 'koa-mount';

import { session } from '../controllers/session';
import { ASSETS_PATH, VENDOR_PATH } from '../../shared/constants';

export default (app) => {
  app.use(mount(ASSETS_PATH, serve(path.resolve('./public'))));
  app.use(mount(VENDOR_PATH, serve(path.resolve('./node_modules'))));

  app.use(session);
};
