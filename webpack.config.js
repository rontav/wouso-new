module.exports = {
  entry: [
    './node_modules/wouso-foundation/components/wouso-qotd/main.jsx',
    './node_modules/wouso-foundation/components/wouso-quest/main.jsx',
    './node_modules/wouso-foundation/components/messages.jsx'
  ],
  output: {
    filename: './node_modules/wouso-foundation/js/bundle.js'
  },
  module: {
    loaders: [{
      //tell webpack to use jsx-loader for all *.jsx files
      test: /\.jsx$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets:['react']
      }
    },
    {
      //tell webpack to use jsx-loader for all *.jsx files
      test: /\.json$/,
      loader: 'json-loader',
      exclude: /node_modules/,
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}
