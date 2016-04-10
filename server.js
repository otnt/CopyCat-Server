'use strict'

const express = require('express');
const server = express();
const routerV0 = require('./api/v0/router.js');
const config = require('./config.js');
const sprintf = require("sprintf-js").sprintf

server.use('/api/v0', routerV0);

server.listen(config.httpPort, () => {
  console.log(sprintf('copy cat listening on port %d !', config.httpPort));
});

// for backard compatibility
server.listen(config.httpDevPort, () => {
  console.log(sprintf('copy cat listening on port %d !', config.httpDevPort));
});
