const path = require('path');
const fs = require('fs-promise');
const gulp = require('gulp');

gulp.task('ensure:logs', () => (
  fs.ensureFile(path.resolve('./logs/server.log'))
));
