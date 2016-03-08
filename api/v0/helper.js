'use strict';

var prefetchPhotoNumber = 10;
module.exports.photoIdListPopulate = {
  path: 'photoIdList',
  select: '_id imageUrl ownerId',
  options: {limit : prefetchPhotoNumber}
}

module.exports.assertHeader = function(actual, wanted, name, res) {
  console.log(wanted);
  console.log(actual);
  console.log(wanted.split("|").indexOf(actual));
  if((wanted !== '*') && (wanted.split("|").indexOf(actual) === -1)) {
    res.status(400).send({'errCode':400, 'errMsg':"Bad request: " + 
          name + " should be '" + wanted + "' but got " + "'" + actual + "'"
    });
    return false;
  }
  return true;
}

//err handling
var errHandle = function() {}
errHandle.notFound = function(res, err) {
  res.status(404).send({'errCode':404, 'errMsg' : "Not found: " + err});
};
errHandle.unknown = function(res, err) {
  res.send({'errMsg':"Unknown error: " + err});
};
errHandle.badRequest = function(res, err) {
  res.status(400).send({'errCode':400, 'errMsg': "Bad request: " + err});
}
module.exports.errHandle = errHandle;
