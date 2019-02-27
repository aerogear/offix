const replace = require('replace');
var fs = require('fs');

module.exports = (cordovaConfigFile, versionName) => {
  replace({
    regex: /version=".*?"/,
    replacement: `version="${versionName}"`,
    paths: [cordovaConfigFile],
    silent: true
  });
};

if (require.main === module) {
  if (!fs.existsSync("plugin.xml")) {
    return;
  }
  console.log("Updating version for ", process.cwd());
  const packageString = fs.readFileSync("./package.json", { encoding: "UTF-8" });
  var version = JSON.parse(packageString).version
  module.exports("plugin.xml", version);
}
