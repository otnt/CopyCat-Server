const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const db = require('./database.js');

module.exports = mongoose.model('User', 
  mongoose.Schema({
      name: { type: String, required: true },
      profilePictureUrl: { type: String, required: true },
      time: { type: Date, default: Date.now, required: true},

      // social network binding
      instagramId: { type: String, index: true }
    },
    { read: 'primaryPreferred' }
  )
);
