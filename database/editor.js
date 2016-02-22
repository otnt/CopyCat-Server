'use strict';

var mongoose = require('mongoose');
var db = require('./database.js');
var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Editor', 
  mongoose.Schema({
      name: String,
      albumIdList: [{type: ObjectId, ref: 'Album'}]
  })
);
