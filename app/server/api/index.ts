import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';

import { apiUrls } from 'common/constants/api';

import authRouter from 'server/api/auth';

import { Context, State } from 'server/types/koa';

const apiRouter = new Router<State, Context>({
  prefix: apiUrls.root,
});

apiRouter.use(bodyParser());

[authRouter].forEach((router) => {
  apiRouter.use(`/${router.apiType}`, router.koaRouter.routes(), router.koaRouter.allowedMethods());
});

export default apiRouter;
