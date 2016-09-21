const cp = require('child_process');
const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const Autoprefixer = require('less-plugin-autoprefix');
const rollup = require('rollup');
const watch = require('rollup-watch');

const { port } = require('./app/config/config.json');
const rollupDevConfig = require('./rollup.dev.config');

let child;

gulp.task('default', ['server:dev', 'watch:server', 'less', 'watch:less', 'client:dev']);

gulp.task('server:dev', () => {
  let promise = Promise.resolve();

  if (child) {
    promise = new Promise((resolve) => {
      child.on('close', () => {
        resolve();
      });

      child.kill();
    });
  }

  return promise.then(() => new Promise((resolve, reject) => {
    child = cp.fork(path.resolve('./app/server/index.js'), [], {
      cwd: __dirname,
      env: {
        NODE_ENV: 'development',
        BOARDER_PORT: port
      }
    });

    child.on('message', (message) => {
      if (message === 'listen-success') {
        resolve();
      } else if (message === 'listen-error') {
        reject(new Error('Listen error'));
      }
    });
  }));
});

gulp.task('client:dev', () => {
  const watcher = watch(rollup, rollupDevConfig);

  watcher.on('event', (event) => {
    console.log(event);

    if (event.code === 'BUILD_START') {
      child.send('toreload');
    }

    if (event.code === 'BUILD_END') {
      child.send('reload');
    }
  });
});

gulp.task('less', () => (
  gulp.src('./app/client/styles/index.less')
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

gulp.task('watch:less', () => (
  gulp.watch('./app/client/styles/**/*.less', ['less'])
));

gulp.task('watch:server', () => (
  gulp.watch([
    './app/server/**/*.!(pug)',
    './app/config/**/*'
  ], ['server:dev'])
));
