'use strict';

var express = require('express');
var server = express();
var handler = require('./handler.js')

server.get('/api/v0/promos/hot', handler.promosHot);
server.get('/api/v0/promos/editor', handler.promosEditor);
server.get('/api/v0/albums/:id', handler.albums);
server.get('/api/v0/photos/:id', handler.photos);

server.listen(3000, function () {
  console.log('copy cat listening on port 3000!');
});
