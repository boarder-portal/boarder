const gulp = require('gulp');
const { requireGlob } = require('./app/server/helpers/require-glob');

process.env.NODE_ENV = 'development';

gulp.task('default', [
  'ensure:dirs',
  'watch:server',
  'copy:fonts',
  'copy:flags',
  'watch:less',
  'client:dev',
  'watch:locales'
]);

requireGlob('./gulp/*.js');
