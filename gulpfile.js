const cp = require('child_process');
const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const run = require('gulp-run');
const sourcemaps = require('gulp-sourcemaps');
const Autoprefixer = require('less-plugin-autoprefix');
const rollup = require('rollup');
const watch = require('rollup-watch');

const { port } = require('./app/config/config.json');
const rollupDevConfig = require('./rollup.dev.config');
const { sendEmail } = require('./app/server/helpers');
const { buildLocales } =require('./app/server/helpers/build-locales');
const {
  en,
  ru
} = require('./app/server/helpers/i18n');

const root = path.resolve('.');
const PUBLIC_PATH = path.resolve('./public');
const PUBLIC_I18N = `${ PUBLIC_PATH }/i18n`;
const SERVER_I18N = `${ root }/app/server/i18n`;
const CLIENT_LOCALES_ROOT = './app/client/locales';
const SERVER_LOCALES_ROOT = './app/server/locales';
const CLIENT_LOCALES = `${ CLIENT_LOCALES_ROOT }/**/*.json`;
const SERVER_LOCALES = `${ SERVER_LOCALES_ROOT }/**/*.json`;
const LESS_ROOT = './app/client/styles/index.less';

let child;

gulp.task('default', ['watch:server', 'copy:fonts', 'watch:less', 'client:dev', 'watch:locales']);

gulp.task('db:migration:create', () => (
  run('sequelize migration:create').exec()
));

gulp.task('db:migrate', () => (
  run('sequelize db:migrate').exec()
));

gulp.task('db:migrate:undo', () => (
  run('sequelize db:migrate:undo').exec()
));

gulp.task('db:migrate:undo:all', () => (
  run('sequelize db:migrate:undo').exec()
));

gulp.task('db:seed:create', () => (
  run('sequelize seed:create').exec()
));

gulp.task('db:seed', () => (
  run('sequelize db:seed:all').exec()
));

gulp.task('db:seed:rerun', ['db:seed:undo:all'], () => (
  run('sequelize db:seed:all').exec()
));

gulp.task('db:seed:undo', () => (
  run('sequelize db:seed:undo').exec()
));

gulp.task('db:seed:undo:all', () => (
  run('sequelize db:seed:undo:all').exec()
));

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

gulp.task('build:server:locales', () => (
  buildLocales(SERVER_LOCALES_ROOT, SERVER_I18N)
));

gulp.task('build:client:locales', () => (
  buildLocales(CLIENT_LOCALES_ROOT, PUBLIC_I18N, true)
));

gulp.task('build:locales', ['build:server:locales', 'build:client:locales']);

gulp.task('email:send', () => (
  sendEmail({
    from: {
      name: 'John Doe',
      email: 'noreply@boarder.tk'
    },
    to: 'oklix16@mail.ru',
    subject: 'Test',
    templatePath: 'email/register',
    locals: {
      i18n: en,
      login: 'droooney',
      confirmLink: 'http://localhost:3333/confirm_register?token=iuh7986tf768g6g'
    }
  })
));

gulp.task('watch:locales', ['watch:server:locales', 'watch:client:locales']);

gulp.task('watch:server:locales', ['build:server:locales'], () => (
  gulp.watch(SERVER_LOCALES, ['toreload', 'build:server:locales', 'reload'])
));

gulp.task('watch:client:locales', ['build:client:locales'], () => (
  gulp.watch(CLIENT_LOCALES, ['toreload', 'build:client:locales', 'reload'])
));

gulp.task('watch:less', ['less'], () => (
  gulp.watch('./app/client/styles/**/*.less', ['toreload', 'less', 'reload'])
));

gulp.task('watch:server', ['server:dev'], () => (
  gulp.watch([
    './app/server/**/*',
    './app/config/**/*'
  ], ['server:dev'])
));

gulp.task('copy:fonts', () => (
  gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./public/fonts/font-awesome'))
));

gulp.task('toreload', () => (
  child.send('toreload')
));

gulp.task('reload', () => (
  child.send('reload')
));
