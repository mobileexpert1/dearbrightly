const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');
const APP_DIR = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'production',
  output: {
    publicPath: '/app-files/',
    path: BUILD_DIR,
    filename: '[name].[hash].js',
    // chunkFilename: 'chunk-[name].[chunkhash].js',
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '*'],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
      maxSize: 200000,
      // cacheGroups: {
      //   vendors: {
      //     test: /[\\/]node_modules[\\/]/,
      //     name: 'vendor',
      //     chunks: 'all',
      //   },
      // },
    },

    minimize: true,
    runtimeChunk: false,
  },
  module: {
    rules: [
      {
        test: /(\.css$)/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /(\.scss$)/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.jsx?/,
        include: APP_DIR,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(woff(2)?|ttf|otf|mp3|eot|png|jpg|jpeg|gif|ico|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: './assets/[sha512:hash:base64:7].[ext]?[hash]',
        },
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      envs: {
        facebook_pixel: process.env.FACEBOOK_PIXEL_ID,
        gtm_id: process.env.GOOGLE_TAG_MANAGER_ID,
        gtm_dev_params: decodeURIComponent(process.env.GOOGLE_TAG_MANAGER_DEV_PARAMS),
        debug: process.env.debug,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': Object.keys(process.env)
        .filter(key => !key.includes('npm_'))
        .reduce(
          (vars, key) => ({
            ...vars,
            [key]: JSON.stringify(process.env[key]),
          }),
          {},
        ),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.ExtendedAPIPlugin(),
  ],
};
