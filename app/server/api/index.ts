import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';

import { apiUrls } from 'common/constants/api';

import { Context, State } from 'server/types/koa';

import authRouter from 'server/api/auth';

const apiRouter = new Router<State, Context>({
  prefix: apiUrls.root,
});

apiRouter.use(bodyParser());

apiRouter.use(apiUrls.auth.root, authRouter.routes(), authRouter.allowedMethods());

export default apiRouter;
