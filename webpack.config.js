const path = require('path')

const productionMode = process.env.NODE_ENV === 'production'

module.exports = {
  mode: productionMode ? 'production' : 'development',
  devtool: false,
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'webpacked.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
}
