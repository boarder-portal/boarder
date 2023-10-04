import { NotFound } from 'http-errors';

import { Middleware } from 'server/types/koa';

const notFound: Middleware = async () => {
  throw NotFound();
};

export default notFound;
