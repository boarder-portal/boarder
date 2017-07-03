const path = require('path');

module.exports = {
  entry: './app/client/index.js',
  output: {
    path: path.resolve('./public/js'),
    filename: 'all.js'
  },
  module: {
    loaders: [
      { test: /.js$/, loader: 'babel!eslint', exclude: /node_modules/ },
      { test: /.json$/, loader: 'json' },
      { test: /.pug$/, loader: 'pug', exclude: [/node_modules/] }
    ]
  },
  watch: true,
  devtool: 'source-map'
};
//test
