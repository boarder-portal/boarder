const gulp = require('gulp');
const run = require('gulp-run');

gulp.task('lint', () => (
  run(`./node_modules/.bin/eslint \\
    app/client/** \\
    app/config/config.js \\
    app/server/** \\
    app/server/** \\
    gulp/** \\
    scripts/** \\
    "./!(gulpfile).js"
  `).exec()
));
