var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
// var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  watchOptions: {
    ignored: /node_modules/
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module:  {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|mp4)$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: "[path][name].[ext]",
                  context: 'src'
                }
            }
        ]
      },
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: '/node_modules'
      }
    ]
  },
  // compilerOptions: {
  // target: "es5",
  //   //this config for target "es5"
  //   lib: ["webworker", "es5", "scripthost"]
  // //uncomment this for target "es6"
  // //"lib": ["webworker", "es6", "scripthost"]
  // },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: 'rawFiles',
        to: 'assets',
      context: 'src'}
    ])
    // new BrowserSyncPlugin({
    //   // browse to http://localhost:3000/ during development,
    //   // ./public directory is being served
    //   host: 'localhost',
    //   port: 3000,
    //   server: { baseDir: ['public'] }
    // })
  ],
  devServer: {
    // Display only errors to reduce the amount of output.
    stats: "errors-only",

    // Parse host and port from env to allow customization.
    //
    // If you use Docker, Vagrant or Cloud9, set
    // host: "0.0.0.0";
    //
    // 0.0.0.0 is available to all network devices
    // unlike default `localhost`.
    host: process.env.HOST, // Defaults to `localhost`
    port: process.env.PORT, // Defaults to 8080
    open: true, // Open the page in browser
  },
  resolve: {
	  extensions: ['.tsx', '.ts', '.js']
  }
};
