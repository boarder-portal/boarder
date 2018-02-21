import path from 'path';
import webpack from 'webpack';

export default {
  entry: './app/client/ix.js',
  output: {
    path: path.resolve('./public/js'),
    filename: 'all.js'
  },
  module: {
    loaders: [
      { test: /.js$/, loader: 'babel!eslint', exclude: /node_modules/ },
      { test: /.json$/, loader: 'json' }
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
