module.exports = (method, middleware) => {
  method = method.toUpperCase();

  return async (ctx, next) => {
    if (ctx.method === method) {
      return middleware(ctx, next);
    }

    await next();
  };
};
