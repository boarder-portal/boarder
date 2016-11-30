const path = require('path');
const autoprefixer = require('autoprefixer');

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
      { test: /.pug$/, loader: 'pug', exclude: [/node_modules/] },
      { test: /\.css$/, loader: 'style!css!postcss' },
      { test: /\.less$/, loader: 'style!css!postcss!less' },
      { test: /\.scss$/, loader: 'style!css!postcss!sass' },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
  },
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ],
  watch: true,
  devtool: 'cheap-module-eval-source-map'
};
