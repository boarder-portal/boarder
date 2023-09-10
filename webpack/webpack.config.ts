import LoadablePlugin from '@loadable/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack, { Configuration } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import nodeExternals from 'webpack-node-externals';

import isNotUndefined from '../app/common/utilities/isNotUndefined';

enum TargetType {
  WEB = 'web',
  NODE = 'node',
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getConfig(target: TargetType): Configuration {
  return {
    name: target,
    mode: IS_PRODUCTION ? 'production' : 'development',
    target,
    entry:
      target === TargetType.WEB
        ? path.resolve('./app/client/client.tsx')
        : path.resolve('./app/server/middlewares/ServerApp.tsx'),
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
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
            'sass-loader',
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
    externals: target === TargetType.NODE ? ['@loadable/component', nodeExternals()] : undefined,
    output: {
      filename: `[${IS_PRODUCTION ? 'contenthash' : 'name'}].js`,
      chunkFilename: `[${IS_PRODUCTION ? 'contenthash' : 'name'}].js`,
      path: path.resolve(`./build/${target}`),
      publicPath: `/build/${target}/`,
      libraryTarget: target === TargetType.NODE ? 'commonjs2' : undefined,
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
    cache: IS_PRODUCTION
      ? false
      : {
          type: 'filesystem',
          cacheDirectory: path.resolve(`./.cache/${target}`),
        },
    plugins: [
      new LoadablePlugin() as any,
      new MiniCssExtractPlugin({
        filename: `[${IS_PRODUCTION ? 'contenthash' : 'name'}].css`,
      }),
      new webpack.DefinePlugin({
        SERVER: target === TargetType.NODE,
      }),
      process.env.ANALYZE_BUNDLE && target === TargetType.WEB ? new BundleAnalyzerPlugin() : undefined,
    ].filter(isNotUndefined),
  };
}

export default [getConfig(TargetType.WEB), getConfig(TargetType.NODE)];
