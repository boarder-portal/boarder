const _ = require('lodash');
const express = require('express');
const constants = require('../../config/constants.json');
const sessionRequired = require('../controllers/session-required');
const uploader = require('../controllers/files');

exports.constructEndpoints = (path, controllers) => {
  const {
    endpoints: {
      [path]: paths,
      [path]: {
        base
      }
    }
  } = constants;
  const router = new express.Router();
  const authMiddleware = require('../controllers/user-auth');

  _.forEach(paths, ({ base, method, session, auth, files }, name) => {
    if (name !== 'base') {
      if (session) {
        router.use(base, sessionRequired);
      }

      if (auth) {
        router.use(base, sessionRequired);
        router.use(base, authMiddleware);
      }

      if (files) {
        router.use(base, uploader[files.type](...files.opts || []));
      }

      router[method](base, controllers[name]);
    }
  });

  return (app) => {
    app.use(base, router);
  };
};
