import path from 'path';
import fs from 'fs-promise';
import _ from 'lodash';
import gulp from 'gulp';

import { toreload, reload } from './livereload';

import { resolveGlob } from '../app/server/helpers/glob';

const root = path.resolve('./');
const PUBLIC_PATH = path.resolve('./public');
const PUBLIC_I18N = `${PUBLIC_PATH}/i18n`;
const SERVER_I18N = `${root}/app/server/i18n`;
const CLIENT_LOCALES_ROOT = './app/client/locales';
const SERVER_LOCALES_ROOT = './app/server/locales';
const CLIENT_LOCALES = `${CLIENT_LOCALES_ROOT}/**/*.json`;
const SERVER_LOCALES = `${SERVER_LOCALES_ROOT}/**/*.json`;

export function buildServerLocales() {
  return outputLocales(SERVER_LOCALES_ROOT, SERVER_I18N);
}

export function buildClientLocales() {
  return outputLocales(CLIENT_LOCALES_ROOT, PUBLIC_I18N, true);
}

export const buildLocales = gulp.parallel(buildServerLocales, buildClientLocales);

export const watchServerLocales = gulp.parallel(buildServerLocales, () => {
  gulp.watch(SERVER_LOCALES, gulp.series(toreload, buildServerLocales, reload));
});

export const watchClientLocales = gulp.parallel(buildClientLocales, () => {
  gulp.watch(CLIENT_LOCALES, gulp.series(toreload, buildClientLocales, reload));
});

export const watchLocales = gulp.parallel(watchServerLocales, watchClientLocales);

function outputLocales(sourceDir, buildDir, client) {
  const locales = {};
  const glob = `${sourceDir}/**/*.json`;

  resolveGlob(glob).forEach((filename) => {
    const relativeFilename = path.relative(sourceDir, filename);
    const modules = relativeFilename.split(path.sep);
    const locale = modules[modules.length - 1].split('.')[0];
    const translations = locales[locale] = locales[locale] || {};

    modules.reduce((localTranslations, module, index) => {
      if (index === modules.length - 1) {
        return _.merge(localTranslations, JSON.parse(
          fs.readFileSync(filename)
        ));
      }

      /* eslint-disable no-return-assign */
      return localTranslations[module] = localTranslations[module] || {};
      /* eslint-enable no-return-assign */
    }, translations);
  });

  _.forEach(locales, (translations, locale) => {
    translations = JSON.stringify(translations);

    const path = `${buildDir}/${locale}.${client ? 'js' : 'json'}`;

    if (client) {
      translations = `window.boarderI18n = '${translations.replace(/'/g, '\\\'')}';`;
    }

    console.log(`locale built: ${path}`);

    fs.outputFileSync(path, translations);
  });
}
