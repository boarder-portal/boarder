import { Middleware } from 'server/types/koa';

const logout: Middleware = async (ctx) => {
  await ctx.state.session.asyncDestroy();

  ctx.body = {};
};

export default logout;
