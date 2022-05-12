import webpack, { Configuration } from 'webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
import LoadablePlugin from '@loadable/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import isNotUndefined from '../app/common/utilities/isNotUndefined';

enum ETarget {
  WEB = 'web',
  NODE = 'node',
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getConfig(target: ETarget): Configuration {
  return {
    name: target,
    mode: IS_PRODUCTION ?
      'production' :
      'development',
    target,
    entry: target === ETarget.WEB ?
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
      target === ETarget.NODE ?
        ['@loadable/component', nodeExternals()] :
        undefined,
    output: {
      filename: `[${
        IS_PRODUCTION ? 'contenthash' : 'name'
      }].js`,
      chunkFilename: `[${
        IS_PRODUCTION ? 'contenthash' : 'name'
      }].js`,
      path: path.resolve(`./build/${target}`),
      publicPath: `/build/${target}/`,
      libraryTarget: target === ETarget.NODE ? 'commonjs2' : undefined,
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
    cache: IS_PRODUCTION ?
      false :
      {
        type: 'filesystem',
        cacheDirectory: path.resolve(`./.cache/${target}`),
      },
    plugins: [
      new LoadablePlugin() as any,
      new MiniCssExtractPlugin({
        filename: `[${
          IS_PRODUCTION ? 'contenthash' : 'name'
        }].css`,
      }),
      new webpack.DefinePlugin({
        SERVER: target === ETarget.NODE,
      }),
      process.env.ANALYZE_BUNDLE && target === ETarget.WEB ?
        new BundleAnalyzerPlugin() :
        undefined,
    ].filter(isNotUndefined),
  };
}

export default [getConfig(ETarget.WEB), getConfig(ETarget.NODE)];
