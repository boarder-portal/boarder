const gulp = require('gulp');
const run = require('gulp-run');

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
  run('sequelize db:migrate:undo:all').exec()
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
