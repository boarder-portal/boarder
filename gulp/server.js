const cp = require('child_process');
const path = require('path');
const gulp = require('gulp');
const watch = require('gulp-watch');
const runSequence = require('run-sequence');

let child;

const ROOT = path.resolve('./');
const SERVER_ROOT = './app/server/index.js';
const SERVER_FILES = [
  './app/server/**/*',
  './app/config/**/*',
  './app/shared/**/*'
];

gulp.task('server:dev', () => {
  let promise = Promise.resolve();

  if (child) {
    promise = new Promise((resolve) => {
      child.on('close', () => {
        resolve();
      });

      child.on('message', (message) => {
        if (message === 'tokill') {
          child.kill();
        }
      });

      child.send('tokill');
    });
  }

  return promise.then(() => new Promise((resolve, reject) => {
    child = cp.fork(path.resolve(SERVER_ROOT), [], {
      cwd: ROOT,
      env: {
        NODE_ENV: 'development'
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

gulp.task('watch:server', ['server:dev'], () => {
  gulp.watch(SERVER_FILES, ['server:dev']);
});
