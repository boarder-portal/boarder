const path = require('path');
const fs = require('fs-promise');
const gulp = require('gulp');

gulp.task('ensure:dirs', () => (
  Promise.all([
    fs.ensureFile(path.resolve('./logs/server.log')),
    fs.ensureDir(path.resolve('./tmp/uploads'))
  ])
));
