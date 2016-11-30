const gulp = require('gulp');
const { requireGlob } = require('./app/server/helpers/require-glob');

process.env.NODE_ENV = 'development';

gulp.task('default', [
  'watch:server',
  'watch:less',
  'watch:client',
  'watch:locales'
]);

gulp.task('init', [
  'ensure:dirs',
  'copy:fonts',
  'copy:flags'
]);

requireGlob('./gulp/*.js');
