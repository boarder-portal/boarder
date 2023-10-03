import RedisStore from 'connect-redis';
import { Request, Response } from 'express';
import expressSession from 'express-session';
import { Socket } from 'socket.io';
import * as util from 'util';

import { Context } from 'server/types/koa';

import { client } from 'server/utilities/redis';

import UserModel from 'server/db/models/user';

const store = new RedisStore({
  client,
});

export const sessionMiddleware = util.promisify(
  expressSession({
    name: process.env.SESSION_COOKIE_NAME,
    store,
    secret: String(process.env.SECRET),
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: new Date(Date.UTC(2038, 0)),
    },
  }),
);

export async function ioSessionMiddleware(socket: Socket, next: (err?: Error) => void): Promise<void> {
  try {
    await sessionMiddleware(socket.request as any, {} as any);

    const userId = (socket.request as any).session.userId;

    socket.user = userId ? (await UserModel.findById(userId))?.toData() ?? null : null;

    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Unknown error', { cause: err }));
  }
}

const sessionPrototype = expressSession.Session.prototype;

sessionPrototype.asyncSave = util.promisify(sessionPrototype.save);
sessionPrototype.asyncDestroy = util.promisify(sessionPrototype.destroy);

export async function session(ctx: Context, next: (err?: any) => Promise<any>) {
  await sessionMiddleware(ctx.req as Request, ctx.res as Response);

  ctx.state.session = (ctx.req as any).session;

  if (!ctx.state.session) {
    return ctx.throw(500, 'No session found');
  }

  await next();
}
