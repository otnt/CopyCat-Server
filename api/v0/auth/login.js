const models = require('../../../database/v0/models.js');
const sprintf = require('sprintf-js').sprintf;

function instagram(instagramInfo, callback) {
  instagramUser = instagramInfo.user;
  copycatUser = null;

  // Create new user or return exist user
  userPromise = null;

  // Find user if it exists
  models.User.find({ instagramId: instagramUser.id })
  .then((user) => {
    if (!user || user.length === 0) {
        user = {
            name: instagramUser.username,
            profilePictureUrl: instagramUser.profile_picture,
            instagramId: instagramUser.id,
        };
        userPromise = models.User.create;
    }
    else {
        user = user[0];
        userPromise = (u) => {return u;}
    }

    copycatUser = user;
    return user;
  })
  // Create user if necessary
  .then(userPromise)
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
