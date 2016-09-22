const path = require('path');
const glob = require('glob');
const { isString } = require('dwayne');

const root = path.resolve('./');
const serverDir = path.resolve('./app/server');

module.exports = {
  requireGlob,

  requireAndExecute(globs, ...args) {
    return requireGlob(globs).forEach((func) => {
      func(...args);
    });
  }
};

function requireGlob(globs) {
  globs = isString(globs) ? [globs] : globs;

  return globs.reduce((modules, singleGlob) => modules.concat(
    glob
      .sync(singleGlob, { root })
      .map((absolutePath) => {
        const relativePath = path.relative(serverDir, absolutePath);

        console.log('Requiring: %s...', relativePath);

        return require(absolutePath);
      })
  ), []);
}
