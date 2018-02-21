import gulp from 'gulp';

export function copyFonts() {
  return gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./public/fonts/font-awesome'));
}
