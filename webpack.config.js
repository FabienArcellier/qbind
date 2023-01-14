const path = require('path');

module.exports = {
  entry: './src/qbind.js',
  mode: 'development',
  devtool: false,
  output: {
    filename: 'qbind.js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist'),
  },
};
