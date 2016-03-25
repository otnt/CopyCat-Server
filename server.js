const express = require('express');
const server = express();
const routerV0 = require('./api/v0/router.js');

server.use('/api/v0', routerV0);

server.listen(3000, () => {
  console.log('copy cat listening on port 3000!');
});
