import User from '../db/models/user';

export default async (ctx, next) => {
  const { user } = ctx.session;

  if (!user) {
    ctx.reject('NOT_AUTHORIZED');
  }

  const dbUser = await User.findOne({
    where: {
      email: user.email
    }
  });

  if (!dbUser) {
    ctx.reject('NOT_AUTHORIZED');
  }

  ctx.user = dbUser;

  await next();
};
