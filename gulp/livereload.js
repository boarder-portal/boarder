const gulp = require('gulp');

gulp.task('toreload', () => {
  const { toreload } = require('../app/server/helpers/livereload');

  toreload();
});
gulp.task('reload', () => {
  const { reload } = require('../app/server/helpers/livereload');

  reload();
});
