const path = require('path');
const pug = require('pug');
const { resolveGlob } = require('../helpers/require-glob');

const viewsDir = path.resolve('./app/server/views');

module.exports = resolveGlob('./app/server/views/**/*.pug')
  .reduce((templates, filename) => {
    const relativeName = path.relative(viewsDir, filename).replace(/.pug$/, '');

    templates[relativeName] = compilePug(filename);

    return templates;
  }, {});

function compilePug(filename) {
  filename = path.resolve(filename);

  return pug.compileFile(filename, {
    filename
  });
}
