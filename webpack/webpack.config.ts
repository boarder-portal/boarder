import LoadablePlugin from '@loadable/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack, { Configuration } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import nodeExternals from 'webpack-node-externals';

enum TargetType {
  WEB = 'web',
  NODE = 'node',
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getConfig(target: TargetType): Configuration {
  const isWeb = target === TargetType.WEB;
  const isNode = target === TargetType.NODE;

  return {
    name: target,
    mode: IS_PRODUCTION ? 'production' : 'development',
    target,
    entry: isWeb ? path.resolve('./app/client/client.tsx') : path.resolve('./app/server/components/ServerApp.tsx'),
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
    externals: isNode ? ['@loadable/component', nodeExternals()] : undefined,
    output: {
      filename: `[${IS_PRODUCTION ? 'contenthash' : 'name'}].js`,
      chunkFilename: `[${IS_PRODUCTION ? 'contenthash' : 'name'}].js`,
      path: path.resolve(`./build/${target}`),
      publicPath: `/build/${target}/`,
      libraryTarget: isNode ? 'commonjs2' : undefined,
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
        SERVER: isNode,
      }),
      process.env.ANALYZE_BUNDLE && isWeb ? new BundleAnalyzerPlugin() : undefined,
    ],
  };
}

export default [getConfig(TargetType.WEB), getConfig(TargetType.NODE)];
