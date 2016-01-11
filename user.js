// MongoDB connector
var mongoose = require('mongoose');

module.exports = mongoose.model('User',
    {
        username : String,
        displayName : String,
        password : String,
    
        photoURI : String,

        likedCount : Number,
        pinCount : Number
    }
)
