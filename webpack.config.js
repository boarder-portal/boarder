const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './app/client/ix.js',
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
  plugins: [
    new webpack.ProvidePlugin({
      Promise: 'es6-promise'
    })
  ],
  watch: true,
  devtool: 'source-map'
};
