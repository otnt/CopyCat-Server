'use strict';

var mongoose = require('mongoose');
var vsprintf = require("sprintf-js").vsprintf
var config = require('../../config.js');
var opts = {
    replset: {
        strategy: 'ping',
        rs_name: 'copycat_replication_set_0',
    },
};
var replicationSetMember = config.databaseAddr;
console.log("connecting to databases: " + config.databaseAddr);
mongoose.connect(vsprintf('mongodb://%s,%s,%s,%s/test', replicationSetMember), opts);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = db;
