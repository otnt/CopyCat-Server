'use strict';

var mongoose = require('mongoose');
var db = require('./database.js');
var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Photo', 
  mongoose.Schema({
      imageUrl: {type: String},
      referenceId: {type: ObjectId, ref: 'Photo'},
      ownerId: {type: ObjectId, ref: 'User', required: true},
      tagList: [String],
      time : { type : Date, default: Date.now, required: true},
      length:{type:Number},
      width:{type:Number}
  })
);
