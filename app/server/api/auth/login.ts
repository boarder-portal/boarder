import { User } from 'common/types';
import { Middleware } from 'server/types/koa';

import UserModel from 'server/db/models/user';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

const login: Middleware<LoginResponse> = async (ctx) => {
  const { body } = ctx.request;

  if (
    typeof body !== 'object' ||
    body === null ||
    !('login' in body) ||
    typeof body.login !== 'string' ||
    !('password' in body) ||
    typeof body.password !== 'string'
  ) {
    return ctx.throw(400);
  }

  const { login, password } = body;

  const user = await UserModel.findOne({ login });

  if (!user) {
    return ctx.throw(400);
  }

  const isSamePassword = await user.validatePassword(password);

  if (!isSamePassword) {
    return ctx.throw(400);
  }

  ctx.state.session.userId = user.getId();

  await ctx.state.session.asyncSave();

  ctx.body = {
    user: user.toData(),
  };
};

export default login;
