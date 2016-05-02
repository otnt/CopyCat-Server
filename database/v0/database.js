const mongoose = require('mongoose');
const vsprintf = require('sprintf-js').vsprintf;
const config = require('../../config.js');
const opts = {
  replset: {
    strategy: 'ping',
    rs_name: 'copycat_replication_set_0',
  },
};
const replicationSetMember = config.replicaAddr;
console.log('connecting to databases: ' + replicationSetMember);
mongoose.connect(vsprintf('mongodb://%s,%s,%s,%s/test', replicationSetMember), opts);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = db;
