const path = require('path');
const gulp = require('gulp');
const watch = require('gulp-watch');
const runSequence = require('run-sequence');
const { buildLocales } = require('../app/server/helpers/build-locales');

const root = path.resolve('./');
const PUBLIC_PATH = path.resolve('./public');
const PUBLIC_I18N = `${PUBLIC_PATH}/i18n`;
const SERVER_I18N = `${root}/app/server/i18n`;
const CLIENT_LOCALES_ROOT = './app/client/locales';
const SERVER_LOCALES_ROOT = './app/server/locales';
const CLIENT_LOCALES = `${CLIENT_LOCALES_ROOT}/**/*.json`;
const SERVER_LOCALES = `${SERVER_LOCALES_ROOT}/**/*.json`;

gulp.task('build:server:locales', () => (
  buildLocales(SERVER_LOCALES_ROOT, SERVER_I18N)
));

gulp.task('build:client:locales', () => (
  buildLocales(CLIENT_LOCALES_ROOT, PUBLIC_I18N, true)
));

gulp.task('build:locales', ['build:server:locales', 'build:client:locales']);

gulp.task('watch:locales', ['watch:server:locales', 'watch:client:locales']);

gulp.task('watch:server:locales', ['build:server:locales'], () => {
  watch(SERVER_LOCALES, () => {
    runSequence('toreload', 'build:server:locales', 'reload');
  });
});

gulp.task('watch:client:locales', ['build:client:locales'], () => {
  watch(CLIENT_LOCALES, () => {
    runSequence('toreload', 'build:client:locales', 'reload');
  });
});
