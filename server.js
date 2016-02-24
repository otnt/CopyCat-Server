'use strict';

var express = require('express');
var server = express();
var routerV0 = require('./api/v0/router.js');

server.use('/api/v0', routerV0);

server.listen(3000, function () {
  console.log('copy cat listening on port 3000!');
});
