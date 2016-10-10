const D = require('dwayne');
const express = require('express');
const constants = require('../../config/constants.json');
const sessionRequired = require('../controllers/session-required');

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

  D(paths).forEach(({ base, method, session }, name) => {
    if (name !== 'base') {
      if (session) {
        router.use(base, sessionRequired);
      }

      router[method](base, controllers[name]);
    }
  });

  return (app) => {
    app.use(base, router);
  };
};
