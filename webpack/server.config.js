const path = require('path');
const webpack = require('webpack');

const commonConfig = require('./common.config');

module.exports = {
  ...commonConfig,
  module: {
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.css$/,
        use: ['file-loader'],
      },
    ],
  },
  entry: path.resolve(__dirname, '../app/server/server.ts'),
  target: 'node',
  output: {
    filename: '[name].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../build/server'),
  },
  plugins: [
    ...commonConfig.plugins,
    new webpack.DefinePlugin({
      SERVER: true,
    }),
  ],
};
