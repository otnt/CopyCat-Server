// MongoDB connector
var mongoose = require('mongoose');

module.exports = mongoose.model('Post',
    {
        timestamp : { type: Date, index: true },
        photoURI : String,
        likedCount : Number,
        pinCount : Number,

        photoWidth : Number,
        photoHeight : Number,
        //photo : ObjectId,
        user :  {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
)
