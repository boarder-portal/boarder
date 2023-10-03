import { User } from 'common/types';
import { Middleware } from 'server/types/koa';

import UserModel from 'server/db/models/user';

export interface RegisterRequest {
  login: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
}

const register: Middleware<RegisterResponse> = async (ctx) => {
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

  const userWithLogin = await UserModel.findOne({ login });

  if (userWithLogin) {
    return ctx.throw(409);
  }

  const user = await UserModel.create({
    login,
    password,
  });

  ctx.state.session.userId = user.getId();

  await ctx.state.session.asyncSave();

  ctx.body = {
    user: user.toData(),
  };
};

export default register;
