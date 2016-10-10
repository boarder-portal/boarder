const gulp = require('gulp');
const { requireGlob } = require('./app/server/helpers/require-glob');

process.env.NODE_ENV = 'development';

gulp.task('default', [
  'watch:server',
  'copy:fonts',
  'create:attachments',
  'watch:less',
  'client:dev',
  'watch:locales'
]);

requireGlob('./gulp/*.js');
