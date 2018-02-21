import path from 'path';
import glob from 'glob';
import _ from 'lodash';

const root = path.resolve('./');
const serverDir = path.resolve('./app/server');

export function resolveGlob(globs) {
  globs = _.isString(globs) ? [globs] : globs;

  return globs.reduce((modules, singleGlob) => modules.concat(
    glob
      .sync(singleGlob, { root })
      .map((filename) => path.resolve(root, filename))
  ), []);
}

export async function importGlob(globs) {
  const exports = [];

  for (const absolutePath of resolveGlob(globs)) {
    const relativePath = path.relative(serverDir, absolutePath);

    console.log('Requiring: %s...', relativePath);

    const exportValue = await import(absolutePath);

    exports.push(exportValue);
  }

  return exports;
}

export async function importAndExecute(globs, ...args) {
  const exports = await importGlob(globs);

  for (const { default: func } of exports) {
    await func(...args);
  }
}
