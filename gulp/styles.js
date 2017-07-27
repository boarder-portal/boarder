const gulp = require('gulp');
const less = require('gulp-less');
const watch = require('gulp-watch');
const runSequence = require('run-sequence');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const Autoprefixer = require('less-plugin-autoprefix');

const LESS_ROOT = './app/client/styles/index.less';
const LESS_FILES = './app/client/styles/**/*.less';

gulp.task('less', () => (
  gulp.src(LESS_ROOT)
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [
        new Autoprefixer({ browsers: ['last 2 versions'] })
      ]
    }))
    .pipe(rename({
      basename: 'all'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/css'))
));

gulp.task('watch:less', ['less'], () => {
  watch(LESS_FILES, () => {
    runSequence('toreload', 'less', 'css-updated');
  });
});
