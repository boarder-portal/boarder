const path = require('path');
const glob = require('glob');
const { isString } = require('dwayne');

const root = path.resolve('./');
const serverDir = path.resolve('./app/server');

const self = module.exports = {
  resolveGlob(globs) {
    globs = isString(globs) ? [globs] : globs;

    return globs.reduce((modules, singleGlob) => modules.concat(
      glob
        .sync(singleGlob, { root })
        .map((filename) => path.resolve(root, filename))
    ), []);
  },

  requireGlob(globs) {
    return self.resolveGlob(globs).map((absolutePath) => {
      const relativePath = path.relative(serverDir, absolutePath);

      console.log('Requiring: %s...', relativePath);

      return require(absolutePath);
    });
  },

  requireAndExecute(globs, ...args) {
    return self.requireGlob(globs).forEach((func) => {
      func(...args);
    });
  }
};
