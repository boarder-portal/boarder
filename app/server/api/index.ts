import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';

import { API_ROOT } from 'common/api';
import authRouter from 'server/api/auth';

import { Context, State } from 'server/types/koa';

const apiRouter = new Router<State, Context>({
  prefix: API_ROOT,
});

apiRouter.use(bodyParser());

[authRouter].forEach((router) => {
  apiRouter.use(`/${router.apiType}`, router.koaRouter.routes(), router.koaRouter.allowedMethods());
});

export default apiRouter;
