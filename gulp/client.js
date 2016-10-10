const gulp = require('gulp');
const rollup = require('rollup');
const watch = require('rollup-watch');
const runSequence = require('run-sequence');

const rollupDevConfig = require('../rollup.dev.config');

gulp.task('client:dev', () => {
  const watcher = watch(rollup, rollupDevConfig);

  watcher.on('event', (event) => {
    console.log(event);

    if (event.code === 'BUILD_START') {
      runSequence('toreload');
    }

    if (event.code === 'BUILD_END') {
      runSequence('reload');
    }
  });
});
