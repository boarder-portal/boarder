const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const D = require('dwayne');
const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const run = require('gulp-run');
const sourcemaps = require('gulp-sourcemaps');
const Autoprefixer = require('less-plugin-autoprefix');
const rollup = require('rollup');
const watch = require('rollup-watch');
const glob = require('glob');

const root = path.resolve('./');
const { port } = require('./app/config/config.json');
const rollupDevConfig = require('./rollup.dev.config');
const LOCALES_ROOT = './app/server/locales';
const LOCALES = `${ LOCALES_ROOT }/**/*.json`;
const LESS_ROOT = './app/client/styles/index.less';
const PUBLIC_PATH = path.resolve('./public');

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

gulp.task('build:locales', (done) => {
  const locales = {};

  fs.stat(`${ PUBLIC_PATH }/i18n`, (err) => {
    if (err) {
      fs.mkdirSync(`${ PUBLIC_PATH }/i18n`);
    }

    glob(LOCALES, { root }, (err, filenames) => {
      if (err) {
        return done(err);
      }

      filenames.forEach((filename) => {
        const absoluteFilename = path.resolve(root, filename);
        const relativeFilename = path.relative(LOCALES_ROOT, filename);
        const modules = relativeFilename.split(path.sep);
        const locale = modules.pop().split('.')[0];
        const translations = locales[locale] = locales[locale] || {};

        modules.push(1);

        modules.reduce((localTranslations, module, index) => {
          if (index === modules.length - 1) {
            return D(localTranslations).deepAssign(JSON.parse(fs.readFileSync(absoluteFilename)));
          }

          /* eslint no-return-assign: 0 */
          return localTranslations[module] = localTranslations[module] || {};
        }, translations);
      });

      D(locales).forEach((translations, locale) => {
        fs.writeFileSync(`${ PUBLIC_PATH }/i18n/${ locale }.json`, D(translations).json());
      });

      done();
    });
  });
});

gulp.task('watch:locales', ['build:locales'], () => (
  gulp.watch(LOCALES, ['build:locales'])
));

gulp.task('watch:less', ['less'], () => (
  gulp.watch('./app/client/styles/**/*.less', ['toreload', 'less', 'reload'])
));

gulp.task('watch:server', ['server:dev'], () => (
  gulp.watch([
    './app/server/**/*.!(pug)',
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
