const gulp = require('gulp');
const { toreload, reload } = require('../app/server/helpers/livereload');

gulp.task('toreload', toreload);
gulp.task('reload', reload);
