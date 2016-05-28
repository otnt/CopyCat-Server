const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

module.exports = mongoose.model('User',
  new mongoose.Schema({
    name: { type: String, required: true, index: true },
    profilePictureUrl: { type: String, required: true },
    time: { type: Date, default: Date.now, required: true },

    // social network binding
    instagramId: { type: String, index: true },
  },
  { read: 'primaryPreferred' }
));
