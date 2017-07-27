const _ = require('lodash');
const Application = require('koa');
const mount = require('koa-mount');
const BodyParser = require('koa-bodyparser');

const { endpoints } = require('../../config/constants.json');
const { sessionRequired } = require('../controllers/session');
const authMiddleware = require('../controllers/user-auth');
const uploader = require('../controllers/files');
const Method = require('../controllers/method');

const bodyParser = BodyParser();

exports.constructEndpoints = (path, controllers) => {
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
};
