const path = require('path');

module.exports = {
  entry: './src/cached-query.js',
  output: {
    filename: 'cached-query.min.js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist'),
  },
};