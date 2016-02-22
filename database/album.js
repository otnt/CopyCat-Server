'use strict';
var mongoose = require('mongoose');
var db = require('./database.js');
var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Album', 
  mongoose.Schema({
      name: {type: String, required: true},
      imageUrl: {type: String, required: true},
      photoIdList: [{type: ObjectId, ref: 'Photo'}],
      ownerId: {type: ObjectId, ref: 'User', required: true},
      tagList: [String],
      time : { type : Date, default: Date.now, required: true}
  })
);
