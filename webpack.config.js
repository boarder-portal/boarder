const path = require('path');

module.exports = {
  entry: './app/client/index.js',
  output: {
    path: path.resolve('./public/js'),
    filename: 'all.js'
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel',
        include: [path.resolve('./app'), /dwayne/],
        query: {
          babelrc: false,
          presets: [
            'es2015',
            'stage-0'
          ],
          plugins: [
            'transform-object-rest-spread',
            'transform-class-properties'
          ]
        }
      },
      { test: /.js$/, loaders: ['eslint'], exclude: /node_modules/ },
      { test: /.json$/, loader: 'json' },
      { test: /.pug$/, loaders: ['pug'], exclude: [/node_modules/] },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.scss$/, loaders: ['style', 'css', 'sass'] }
    ]
  },
  watch: true,
  devtool: 'cheap-module-eval-source-map'
};
