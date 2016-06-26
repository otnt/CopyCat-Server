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

console.log(process.argv);

// For dev.
server.listen(config.httpDevPort, () => {
  console.log(sprintf('copy cat listening on port %d !', config.httpDevPort));
});
// For prod.
server.listen(config.httpPort, () => {
  console.log(sprintf('copy cat listening on port %d !', config.httpPort));
});
