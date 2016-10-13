const gulp = require('gulp');
const rollup = require('rollup');
const watch = require('rollup-watch');
const { toreload, reload } = require('../app/server/helpers/livereload');

const rollupDevConfig = require('../rollup.dev.config');

gulp.task('client:dev', () => {
  const watcher = watch(rollup, rollupDevConfig);

  watcher.on('event', (event) => {
    console.log(event);

    if (event.code === 'BUILD_START') {
      toreload();
    }

    if (event.code === 'BUILD_END') {
      reload();
    }
  });
});
