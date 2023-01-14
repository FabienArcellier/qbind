const path = require('path');

module.exports = {
  entry: './src/qbind.js',
  mode: 'development',
  output: {
    filename: 'qbind.js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist'),
  },
};
