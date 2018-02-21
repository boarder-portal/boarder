require('babel-register')({
  babelrc: false,
  plugins: [
    'transform-es2015-modules-commonjs',
    'dynamic-import-node',
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-function-bind',
    'transform-decorators-legacy',
    'transform-do-expressions',
    'transform-export-extensions'
  ]
});
