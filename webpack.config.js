var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var path = require('path');

var exp = {
  devServer: {
    host: '0.0.0.0',
    port: 8090
  },
  devtool: 'eval',
  entry: [
    './modules/wouso-foundation/components/wouso-qotd/main.jsx',
    './modules/wouso-foundation/components/wouso-quest/main.jsx',
    './modules/wouso-foundation/components/messages.jsx',
    './modules/wouso-foundation/components/profile.jsx',
    './modules/wouso-foundation/components/admin.jsx'
  ],
  output: {
    path: path.join(__dirname, 'assets'),
    filename: '[name].js',
    publicPath: '/assets/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'transform-class-properties',
                'syntax-async-functions'
              ],
              presets: [
                ['es2017'],
                'react'
              ]
            }
          }
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'image/png'
            }
          }
        ]
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'image/jpg'
            }
          }
        ]
      },
      {
        test: /\.gif$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              minetype: 'image/gif'
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        use: 'url-loader'
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          autoprefixer(),
          precss()
        ]
      }
    })
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, '/modules'),
      'node_modules'
    ],
    alias: {
      config: path.resolve(__dirname, `config.js`)
    },
    extensions: ['.js', '.jsx']
  },
  performance: {
    hints: false
  }
}

module.exports = exp;
