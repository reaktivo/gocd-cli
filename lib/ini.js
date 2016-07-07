const fs = require('fs');
const path = require('path');
const ini = require('ini');
const iniFile = '.gocd-cli';
const iniFullPath = path.join(
  process.cwd(),
  iniFile
);

module.exports = function() {
  return {
    read: function read() {
      try {
        const rawConfig = fs.readFileSync(iniFullPath, 'utf8');
        return ini.decode(rawConfig);
      } catch(e) {}

      return {};
    },

    write: function write(config) {
      const parsedConfig = ini.encode(config);
      return fs.writeFileSync(iniFullPath, parsedConfig);
    }
  }
}
