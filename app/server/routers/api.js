import Application from 'koa';
import mount from 'koa-mount';

import errors from '../controllers/errors';
import helpers from '../controllers/helpers';
import { importAndExecute } from '../helpers';
import { endpoints } from '../../shared/constants';

const apiApp = new Application();

export default async (app) => {
  await importAndExecute('/app/server/routers/api/*.js', apiApp);

  app.use(errors);
  app.use(helpers);
  app.use(mount(endpoints.base, apiApp));
};
