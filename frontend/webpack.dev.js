const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const APP_DIR = path.resolve(__dirname, 'src');

// const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  output: {
    publicPath: '/app-files/',
    // chunkFilename: 'chunk-[name].[contenthash].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimize: false,
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '*'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: './index.html',
      envs: {
        debug: process.env.debug,
        facebook_pixel: process.env.FACEBOOK_PIXEL_ID,
        gtm_id: process.env.GOOGLE_TAG_MANAGER_ID,
        gtm_dev_params: decodeURIComponent(process.env.GOOGLE_TAG_MANAGER_DEV_PARAMS),
        highlight_account_id: process.env.HIGHLIGHT_ACCOUNT_ID,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': Object.entries(process.env).reduce(
        (acc, [key, value]) =>
          key.includes('npm_')
            ? acc
            : {
                ...acc,
                [key]: JSON.stringify(value),
              },
        {},
      ),
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.ExtendedAPIPlugin(),
    new webpack.WatchIgnorePlugin([path.join(__dirname, 'node_modules')]),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      // {
      //     enforce: 'pre',
      //     test: isDevelopment ? /\.jsx?$/ : /\.null/,
      //     exclude: /node_modules/,
      //     use: 'eslint-loader',
      // },
      {
        test: /\.jsx?/,
        include: APP_DIR,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /(\.css$)/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /(\.scss$)/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|gif|svg|png|woff|woff2|eot|ttf|svg|otf)$/,
        loader: 'url-loader?limit=100000',
      },
    ],
  },
  devServer: {
    hot: true,
    hotOnly: false,
    inline: true,
    host: '0.0.0.0',
    port: 8001,
    publicPath: 'http://localhost:8001/',
    stats: 'minimal',
    historyApiFallback: true,
    disableHostCheck: true,
    writeToDisk: true,
    sockPath: '/app-socket',
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
};
