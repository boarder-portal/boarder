const D = require('dwayne');
const path = require('path');
const pug = require('pug');
const { resolveGlob } = require('./require-glob');

const viewsDir = path.resolve('./app/server/views');

exports.templates = resolveGlob('./app/server/views/**/*.pug')
  .reduce((templates, filename) => {
    const relativeName = D(path.relative(viewsDir, filename))
      .replace(/.pug$/)
      .replaceString(path.sep, '/');

    templates[relativeName] = compilePug(filename);

    return templates;
  }, {});

function compilePug(filename) {
  filename = path.resolve(filename);

  return pug.compileFile(filename, {
    filename
  });
}
