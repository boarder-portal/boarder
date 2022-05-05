const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.pcss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    alias: {
      client: path.resolve(__dirname, '../app/client'),
      common: path.resolve(__dirname, '../app/common'),
      server: path.resolve(__dirname, '../app/server'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  cache: {
    type: 'filesystem',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `[${
        process.env.NODE_ENV === 'production' ? 'contenthash' : 'name'
      }].css`,
    }),
  ],
};
