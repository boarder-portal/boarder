const path = require('path');
const gulp = require('gulp');
const run = require('gulp-run');

const sequelizePath = path.resolve('./node_modules/.bin/sequelize');
const sequelizeCommand = `${ sequelizePath }`;

gulp.task('db:migration:create', () => (
  run(`${ sequelizeCommand } migration:create`).exec()
));

gulp.task('db:migrate', () => (
  run(`${ sequelizeCommand } db:migrate`).exec()
));

gulp.task('db:migrate:undo', () => (
  run(`${ sequelizeCommand } db:migrate:undo`).exec()
));

gulp.task('db:migrate:undo:all', () => (
  run(`${ sequelizeCommand } db:migrate:undo:all`).exec()
));

gulp.task('db:seed:create', () => (
  run(`${ sequelizeCommand } seed:create`).exec()
));

gulp.task('db:seed', () => (
  run(`${ sequelizeCommand } db:seed:all`).exec()
));

gulp.task('db:seed:rerun', ['db:seed:undo:all'], () => (
  run(`${ sequelizeCommand } db:seed:all`).exec()
));

gulp.task('db:seed:undo', () => (
  run(`${ sequelizeCommand } db:seed:undo`).exec()
));

gulp.task('db:seed:undo:all', () => (
  run(`${ sequelizeCommand } db:seed:undo:all`).exec()
));
