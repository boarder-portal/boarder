const gulp = require('gulp');

gulp.task('toreload', () => {
  const { emit } = require('../app/server/helpers/livereload');

  emit('toreload');
});

gulp.task('reload', () => {
  const { emit } = require('../app/server/helpers/livereload');

  emit('reload');
});

gulp.task('css-updated', () => {
  const { emit } = require('../app/server/helpers/livereload');

  emit('css-updated');
});
