var yaml = require('js-yaml');
var fs   = require('fs');

var config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
module.exports = config;
