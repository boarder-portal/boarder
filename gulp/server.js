import path from 'path';
import cp from 'child_process';
import gulp from 'gulp';

let child;

const ROOT = path.resolve('./');
const SERVER_ROOT = './app/server/index.js';
const SERVER_FILES = [
  './app/server/**/*',
  './app/config/**/*',
  './app/shared/**/*'
];

export async function serverDev() {
  if (child) {
    await new Promise((resolve) => {
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

  await new Promise((resolve, reject) => {
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
  });
}

export const watchServer = gulp.parallel(serverDev, () => {
  gulp.watch(SERVER_FILES, serverDev);
});
