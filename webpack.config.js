const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: {
    web: './tests/src/test.ts',
    worker: './@paintbucket/processor/src/worker.ts'
  },
  devtool: 'inline-source-map',
  mode: 'development',
  optimization: {
    runtimeChunk: 'single'
  },
  devServer: {
    watchFiles: ['./tests/**/*', './@paintbucket/**/*'],
    static: [
      path.join(__dirname, './tests/src'),
      path.join(__dirname, './@paintbucket/processor/src'),
    ],
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    liveReload: true,
    compress: true,
    port: 8080,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './tests/src/index.html',
      chunks: ['web']
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(gif|png|jpe?g|webp)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/images/'
            }
          }
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '...'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: (pathData) => {
      const { filename } = pathData
      return filename.endsWith('.ts') ? '[name]-[hash].js' : '[hash][ext][query]'
    }
  }
}
