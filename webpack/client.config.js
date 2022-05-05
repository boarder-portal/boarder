const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const commonConfig = require('./common.config');

module.exports = {
  ...commonConfig,
  module: {
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  entry: path.resolve(__dirname, '../app/client/client.tsx'),
  output: {
    filename: `[${
      process.env.NODE_ENV === 'production' ? 'contenthash' : 'name'
    }].js`,
    chunkFilename: `[${
      process.env.NODE_ENV === 'production' ? 'contenthash' : 'name'
    }].js`,
    path: path.resolve(__dirname, '../build/client'),
  },
  plugins: [
    ...commonConfig.plugins,
    new LoadablePlugin(),
    new webpack.DefinePlugin({
      SERVER: false,
    }),
    process.env.ANALYZE_BUNDLE ? new BundleAnalyzerPlugin() : undefined,
  ].filter(Boolean),
};
