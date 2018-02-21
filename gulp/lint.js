import run from 'gulp-run';

export function lint() {
  return run(`./node_modules/.bin/eslint \\
    app/client/** \\
    app/server/** \\
    app/shared/** \\
    gulp/** \\
    scripts/** \\
  `, { verbosity: 3 }).exec();
}
