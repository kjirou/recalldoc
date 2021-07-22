const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

const productionMode = process.env.NODE_ENV === 'production'

const optimization = productionMode
  ? {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  }
  : {}

module.exports = {
  mode: productionMode ? 'production' : 'development',
  devtool: false,
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: productionMode ? 'webpacked-prod.js' : 'webpacked.js',
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
  optimization,
}
