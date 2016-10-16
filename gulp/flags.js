const gulp = require('gulp');

const flags = ['ru', 'gb'];

gulp.task('copy:flags', () => (
  gulp.src(`./node_modules/flag-icon-css/flags/4x3/@(${ flags.join('|') }).svg`)
    .pipe(gulp.dest('./public/images/flags/4x3'))
));
