import Router from '@koa/router';

import { apiUrls } from 'common/constants/api';

import { Context, State } from 'server/types/koa';

import login from 'server/api/auth/login';
import logout from 'server/api/auth/logout';
import register from 'server/api/auth/register';

const authRouter = new Router<State, Context>();

authRouter.post(apiUrls.auth.login, login);
authRouter.post(apiUrls.auth.logout, logout);
authRouter.post(apiUrls.auth.register, register);

export default authRouter;
