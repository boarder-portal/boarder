const gulp = require('gulp');

gulp.task('copy:fonts', () => (
  gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./public/fonts/font-awesome'))
));
