import gulp from 'gulp';
import run from 'gulp-run';

export function dbMigrationCreate() {
  return run('sequelize migration:create').exec();
}

export function dbMigrate() {
  return run('sequelize db:migrate').exec();
}

export function dbMigrationUndo() {
  return run('sequelize db:migrate:undo').exec();
}

export function dbMigrationUndoAll() {
  return run('sequelize db:migrate:undo:all').exec();
}

export function dbSeedCreate() {
  return run('sequelize seed:create').exec();
}

export function dbSeed() {
  return run('sequelize db:seed:all').exec();
}

export const dbSeedRerun = gulp.series(dbSeedUndoAll, dbSeed);

export function dbSeedUndoAll() {
  return run('sequelize db:seed:undo:all').exec();
}
