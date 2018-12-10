const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('log.txt', { flags: 'w' });

function log() {
  logFile.write(util.format.apply(null, arguments) + '\n');
}

function save() {
  fs.writeFile('save.json', util.format.apply(null, arguments), () => {});
}

module.exports = {
  log,
  save
}