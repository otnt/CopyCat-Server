'use strict';

/**
 * Populate photo id list to album with restriction.
 */

var prefetchPhotoNumber = 10;
module.exports.photoIdListPopulate = {
  path: 'photoIdList',
  select: '_id imageUrl ownerId',
  options: {limit : prefetchPhotoNumber}
}

/**
 * Assert http request header given name and wanted field value
 */

module.exports.assertHeader = function(req, res, log, name, wanted) {
  var actual = req.get(name);
  if((wanted !== '*') && (wanted.split("|").indexOf(actual) === -1)) {
    res.status(400).send({'errCode':400, 'errMsg':"Bad request: " + 
          name + " should be '" + wanted + "' but got " + "'" + actual + "'"
    });
    log.info("Assert header %s, wanted: %s, actual: %s, failed", name, wanted, actual);
    return false;
  }
  log.info("Assert header %s, wanted: %s, actual: %s, passed", name, wanted, actual);
  return true;
}

/**
 * Error handling.
 * Given error type, respond object.
 */

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


/**
 * Logger system.
 */

var bunyan = require('bunyan');
var uuid = require('node-uuid');

function photoSerializer(photo) {
  return {
    id: photo._id,
    imageUrl: photo.imageUrl,
    referenceId: photo.referenceId,
  };
}
function editorSerializer(editor) {
  return {
    id: editor._id,
    name: editor.name,
  }
}
function albumSerializer(album) {
  return {
    id: album._id,
    name: album.name,
    imageUrl: album.imageUrl,
  }
}
function userSerializer(user) {
  return {
    id: user._id,
    name: user.name,
  }
}
function reqSerializer(req) {
  return {
    method: req.method,
    url: req.originalUrl,
  }
}
function resSerializer(res) {
  return {
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
  }
}
var log = bunyan.createLogger({
    name: 'copycat',
    streams: [
      {
        level: 'trace',
        stream: process.stdout  // log TRACE and above to stdout
      },
      {
        level: 'debug',
        path: './log/copycat-debug.log' // log DEBUG and above to a file
      },
      {
        level: 'info',
        path: './log/copycat-info.log' // log INFO and above to a file
      },
      {
        level: 'error',
        path: './log/copycat-error.log' // log ERROR and above to a file
      },
    ],
    serializers: {
      err: bunyan.stdSerializers.err,
      req: reqSerializer,
      res: resSerializer,
      photo: photoSerializer,
      album: albumSerializer,
      editor: editorSerializer,
      user: userSerializer,
    },
});
module.exports.log = log;

module.exports.logReqIdMiddleware = function logReqIdMiddleware(req, res, next) {
  req.log = log.child({reqId: uuid.v1()});
  next();
};
module.exports.logReq = function logReq(log, req) {
  log.info({req:req}, "New request");
}
module.exports.logRes = function logReq(log, res) {
  log.info({res:res}, "New response");
}

/**
 * PromiseReject, used in Promise to as reject method
 */
function PromiseReject(message) {
    this.name = 'MyError';
    this.message = message;
    this.stack = (new Error()).stack;
}
PromiseReject.prototype = new Error; 
module.exports.PromiseReject = PromiseReject;







