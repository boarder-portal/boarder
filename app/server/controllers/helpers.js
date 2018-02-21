export default async (ctx, next) => {
  ctx.json = (body) => {
    ctx.type = 'json';
    ctx.body = body;
  };

  ctx.success = (...args) => {
    ctx.json({
      success: args.length
        ? !!args[0]
        : true
    });
  };

  await next();
};
