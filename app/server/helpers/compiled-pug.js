import path from 'path';
import pug from 'pug';

import { resolveGlob } from './glob';

const viewsDir = path.resolve('./app/server/views');

export const templates = resolveGlob('./app/server/views/**/*.pug')
  .reduce((templates, filename) => {
    const relativeName = path.relative(viewsDir, filename)
      .replace(/.pug$/, '')
      .split(path.sep)
      .join('/');

    templates[relativeName] = compilePug(filename);

    return templates;
  }, {});

function compilePug(filename) {
  filename = path.resolve(filename);

  return pug.compileFile(filename, {
    filename
  });
}
