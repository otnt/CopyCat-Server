'use strict'

const models = require('../../../database/v0/models.js');
const sprintf = require('sprintf-js').sprintf;

function instagram(instagramInfo, callback) {
  let instagramUser = instagramInfo.user;
  let copycatUser = null;

  // Create new user or return exist user
  let needCreate = false;

  // Find user if it exists
  models.User.find({ instagramId: instagramUser.id })
  .then((user) => {
    if (!user || user.length === 0) {
        user = {
            name: instagramUser.username,
            profilePictureUrl: instagramUser.profile_picture,
            instagramId: instagramUser.id,
        };
        needCreate = true;
    }
    else {
        user = user[0];// only one user could exist
        needCreate = false;
    }

    copycatUser = user;
    return user;
  })
  // Create user if necessary
  .then(function(user) {
      if(needCreate) {
          return models.User.create(user);
      }
      else {
          return user;
      }
  })
  // Assert user create succeed and return
  .then((user) => {
    if (!user) {
        callback(new Error(sprintf('create copycat user %j failed', copycatUser)), null);
    }
    else {
        callback(null, {
            instagram: instagramInfo,
            copycat: user,
        });
    }
  })
  //error handling
  .catch((err) => { callback(err) });
}

module.exports.instagram = instagram;
