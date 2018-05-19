const path = require('path');

module.exports = {
  entry: './src/js.js',
  mode: 'development',
  output: {
    filename: 'js.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        },
        exclude: path.resolve(__dirname, 'index.html')
      }
    ]
  }
};