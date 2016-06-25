// Make debug errno 'enoent' syscall 'spawn' easier
// http://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();


const express = require('express');
const server = express();
const routerV0 = require('./api/v0/router.js');
const config = require('./config.js');
const sprintf = require('sprintf-js').sprintf;
const ArgumentParser = require('argparse').ArgumentParser;

server.use('/api/v0', routerV0);
server.use('/privacy-policy', express.static('privacy-policy'));
server.use('/test', express.static('da'));

// Argument parser.
const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Run "sudo npm start [--dev]"'
});
parser.addArgument(
  [ '--dev' ],
  {
    help: 'Only use 3000 port to test, useful to test on local machine.'
  }
);
const args = parser.parseArgs();

if (args.hasOwnProperty('dev')) {
  // For dev.
  server.listen(config.httpDevPort, () => {
    console.log(sprintf('copy cat listening on port %d !', config.httpDevPort));
  });
} else {
  // For prod.
  server.listen(config.httpPort, () => {
    console.log(sprintf('copy cat listening on port %d !', config.httpPort));
  });
}
