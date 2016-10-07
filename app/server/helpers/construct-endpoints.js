const D = require('dwayne');
const express = require('express');
const constants = require('../../config/constants.json');

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

  D(paths).forEach(({ base, method }, name) => {
    if (name !== 'base') {
      router[method](base, controllers[name]);
    }
  });

  return (app) => {
    app.use(base, router);
  };
};
