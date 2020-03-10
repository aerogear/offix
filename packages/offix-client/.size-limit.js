const path = require('path');
const packageName = require("./package.json").name;

const config = {
  "name": packageName,
  "limit": "38kb",
  "path": path.join(__dirname, '/dist/**/*.js')
};

module.exports = [
  config
];
