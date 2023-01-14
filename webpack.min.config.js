const path = require('path');

module.exports = {
  entry: './src/qbind.js',
  mode: "production",
  output: {
    filename: 'qbind.min.js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, 'dist'),
  },
};
