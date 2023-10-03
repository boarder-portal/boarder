import { RouterParamContext } from '@koa/router';
import expressSession from 'express-session';
import { Middleware as KoaMiddleware, ParameterizedContext } from 'koa';

import { User } from 'common/types';

export interface State {
  user: User | null;
  session: expressSession.Session;
}

export type Context<Body = unknown> = ParameterizedContext<State, RouterParamContext<State, unknown>, Body>;

export type Middleware<Body = unknown> = KoaMiddleware<State, Context<Body>, Body>;

export type Query<Payload extends object> = {
  [K in keyof Payload]?: string | string[];
};
