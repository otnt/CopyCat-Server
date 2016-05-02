const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Report',
  new mongoose.Schema({
    name: {
      name: { type: String },
    },
    ownerId: { type: ObjectId, ref: 'User', required: true },
    time: { type: Date, default: Date.now, required: true },
  },
  { read: 'primaryPreferred' }
  )
);

