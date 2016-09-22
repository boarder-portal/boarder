const D = require('dwayne');

module.exports = (paths, controllers, router) => {
  D(paths).forEach(({ base, method }, name) => {
    if (name !== 'base') {
      router[method](base, controllers[name]);
    }
  });
};
