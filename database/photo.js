'use strict';

var mongoose = require('mongoose');
var db = require('./database.js');
var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Photo', 
  mongoose.Schema({
      imageUrl: {type: String, required: true},
      referenceId: {type: ObjectId, ref: 'Photo'},
      ownerId: {type: ObjectId, ref: 'User', required: true},
      tagList: [String]
  })
);
