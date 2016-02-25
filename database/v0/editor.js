'use strict';

var mongoose = require('mongoose');
var db = require('./database.js');
var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Editor', 
  mongoose.Schema({
      name: {type:String, required:true},
      albumIdList: [{type: ObjectId, ref: 'Album'}],
      time : { type : Date, default: Date.now, required: true}
  })
);
