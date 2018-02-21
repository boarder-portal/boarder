import _ from 'lodash';
import Application from 'koa';
import mount from 'koa-mount';
import BodyParser from 'koa-bodyparser';

import { endpoints } from '../../shared/constants';
import { sessionRequired } from '../controllers/session';
import authMiddleware from '../controllers/user-auth';
import uploader from '../controllers/files';
import Method from '../controllers/method';

const bodyParser = BodyParser();

export function constructEndpoints(path, controllers) {
  const {
    [path]: paths,
    [path]: {
      base
    }
  } = endpoints;
  const pathEndpoints = new Application();

  _.forEach(paths, ({ base, method, session, auth, files }, name) => {
    if (name !== 'base') {
      const endpoint = new Application();

      if (session) {
        endpoint.use(sessionRequired);
      }

      if (auth) {
        endpoint.use(sessionRequired);
        endpoint.use(authMiddleware);
      }

      if (files) {
        endpoint.use(uploader[files.type](...files.opts || []));
      } else if (method === 'post' || method === 'put') {
        endpoint.use(bodyParser);
      }

      endpoint.use(Method(method, controllers[name]));

      pathEndpoints.use(mount(base, endpoint));
    }
  });

  return (app) => {
    app.use(mount(base, pathEndpoints));
  };
}
