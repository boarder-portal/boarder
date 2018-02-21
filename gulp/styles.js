import gulp from 'gulp';
import gulpLess from 'gulp-less';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import Autoprefixer from 'less-plugin-autoprefix';

import { toreload, cssUpdated } from './livereload';

const LESS_ROOT = './app/client/styles/index.less';
const LESS_FILES = './app/client/styles/**/*.less';

export function less() {
  return gulp.src(LESS_ROOT)
    .pipe(sourcemaps.init())
    .pipe(gulpLess({
      plugins: [
        new Autoprefixer({ browsers: ['last 2 versions'] })
      ]
    }))
    .pipe(rename({
      basename: 'all'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/css'));
}

export const watchLess = gulp.parallel(less, () => {
  gulp.watch(LESS_FILES, gulp.series(toreload, less, cssUpdated));
});
