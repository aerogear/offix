const path = require('path');
const fs = require('fs');

const packagesDir = path.join(__dirname, 'packages/');
const packages = fs.readdirSync(packagesDir);

const packageLimits = packages.map(function(p) {
  const [ sizeConfig ] =  require(`${packagesDir}/${p}/.size-limit.js`);
  return sizeConfig;
});

const overallConfig = {
  name: "offix (total)",
  limit: "40kb",
  path: [
    'packages/*/dist/**/*.js',
    '!packages/offix-client-boost/dist/**/*.js'
  ]
}

packageLimits.push(overallConfig);

module.exports = packageLimits;
