'use strict';

var prefetchPhotoNumber = 10;
module.exports.photoIdListPopulate = {
  path: 'photoIdList',
  select: '_id imageUrl ownerId',
  options: {limit : prefetchPhotoNumber}
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
