const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const watch = require('rollup-watch');

const createServer = require('./app/server');
const {
  port,
  livereloadPort
} = require('./app/config/config.json');
const rollupDevConfig = require('./rollup.dev.config');

gulp.task('default', ['server:dev', 'client']);

gulp.task('server:dev', ['dev', 'server']);

gulp.task('client:dev', ['dev', 'client']);

gulp.task('server', () => createServer().listen(port));

gulp.task('client:js', () => {
  process.env.BOARDER_ENV = 'client';

  const watcher = watch(rollup, rollupDevConfig);
  const {
    io,
    listen
  } = createServer('livereload');

  return listen(livereloadPort).then(() => {
    watcher.on('event', (event) => {
      console.log(event);

      if (event.code === 'BUILD_START') {
        io.emit('toreload');
      }

      if (event.code === 'BUILD_END') {
        io.emit('reload');
      }
    });
  });
});

gulp.task('dev', () => {
  process.env.NODE_ENV = 'development';
});
