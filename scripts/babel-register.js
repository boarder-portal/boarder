require('babel-register')({
  babelrc: false,
  plugins: [
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-function-bind',
    'transform-decorators-legacy',
    'transform-do-expressions'
  ]
});
