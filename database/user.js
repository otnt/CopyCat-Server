'use strict';
var mongoose = require('mongoose');
var db = require('./database.js');

module.exports = mongoose.model('User', 
  mongoose.Schema({
      name: {type: String, required: true}
  })
);
