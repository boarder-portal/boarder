const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function getConfig(target) {
  return {
    name: target,
    mode: process.env.NODE_ENV === 'production' ?
      'production' :
      'development',
    target,
    entry: target === 'web' ?
      path.resolve('./app/client/client.tsx') :
      path.resolve('./app/server/middlewares/ServerApp.tsx'),
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
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
            },
          ],
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    externals:
      target === 'node' ?
        ['@loadable/component', nodeExternals()] :
        undefined,
    output: {
      filename: `[${
        process.env.NODE_ENV === 'production' ? 'contenthash' : 'name'
      }].js`,
      chunkFilename: `[${
        process.env.NODE_ENV === 'production' ? 'contenthash' : 'name'
      }].js`,
      path: path.resolve(`./build/${target}`),
      publicPath: `/build/${target}/`,
      libraryTarget: target === 'node' ? 'commonjs2' : undefined,
    },
    resolve: {
      alias: {
        client: path.resolve('./app/client'),
        common: path.resolve('./app/common'),
        server: path.resolve('./app/server'),
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'source-map',
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(`./.cache/${target}`),
    },
    plugins: [
      new LoadablePlugin(),
      new MiniCssExtractPlugin({
        filename: `[${
          process.env.NODE_ENV === 'production' ? 'contenthash' : 'name'
        }].css`,
      }),
      new webpack.DefinePlugin({
        SERVER: target === 'node',
      }),
      process.env.ANALYZE_BUNDLE && target === 'web' ?
        new BundleAnalyzerPlugin() :
        undefined,
    ].filter(Boolean),
  };
}

module.exports = [getConfig('web'), getConfig('node')];
