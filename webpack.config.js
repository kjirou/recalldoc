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
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
}
