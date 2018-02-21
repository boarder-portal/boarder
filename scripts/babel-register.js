require('babel-register')({
  babelrc: false,
  plugins: [
    'syntax-object-rest-spread',
    'transform-es2015-modules-commonjs',
    'dynamic-import-node',
    'transform-class-properties',
    'transform-function-bind',
    'transform-do-expressions',
    'transform-export-extensions'
  ]
});
