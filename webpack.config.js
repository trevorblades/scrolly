const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {resolve} = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const APP_TITLE = 'Scrolly';
const BUILD_DIR = resolve(__dirname, 'build');

const config = {
  entry: ['babel-polyfill', './src/index'],
  output: {
    filename: 'bundle.js',
    path: BUILD_DIR,
    publicPath: '/'
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'babel-loader!react-svg-loader'
      }
    ]
  },
  plugins: [
    new FaviconsWebpackPlugin({
      title: APP_TITLE,
      logo: './src/assets/favicon.png',
      icons: {
        favicons: true
      }
    }),
    new HtmlWebpackPlugin({
      title: APP_TITLE,
      template: './src/index.ejs'
    }),
    new webpack.DefinePlugin({
      API_URL: JSON.stringify(
        process.env.NODE_ENV === 'production'
          ? 'https://api.scrol.ly'
          : 'http://localhost:8000'
      )
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  module.exports = config;
} else {
  module.exports = merge(
    {
      entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server'
      ],
      devtool: 'inline-source-map',
      devServer: {
        hot: true,
        port: 3000,
        historyApiFallback: true
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
      ]
    },
    config
  );
}
