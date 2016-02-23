'use strict';

var db = require("./database/database.js");
var User = require("./database/user.js");
var Photo = require("./database/photo.js");
var Album = require("./database/album.js");
var Editor = require("./database/editor.js");
var PythonShell = require('python-shell');

var prefetchPhotoNumber = 10;
var photoIdListPopulate = {
  path: 'photoIdList',
  select: '_id imageUrl ownerId',
  options: {limit : prefetchPhotoNumber}
}

//hot
exports.promosHot = function(req, res) {
  var queryCondition = {};
  var maxId = req.query.maxId;
  var sinceId = req.query.sinceId;
  var count = req.query.count;
  if(count && isNaN(parseInt(count))) {
    errHandle.badRequest(res, "count should be numeric but is " + count);
    return;
  }
  count = count ? (count > 200 ? 200 : count) : 20;
  if(maxId) {
    if(!queryCondition._id) {
      queryCondition._id = {};
    }
    queryCondition._id['$lt'] = maxId;
  }
  if(sinceId) {
    if(!queryCondition._id) {
      queryCondition._id = {};
    }
    queryCondition._id['$gt'] = sinceId;
  }
  Album
  .find(queryCondition)
  .sort({_id:-1})
  .limit(parseInt(count))
  .populate(photoIdListPopulate)
  .exec(function(err, albums){
    if(err) {
      errHandle.unknown(res, err);
    }
    else{
      res.send(albums);
    }
  })
}

//editor's choice
exports.promosEditor = function(req, res) {
  var id = req.query.id;
  if(id) {
    Editor.findById(id, function(err, editor){
      if(err) return errHandle.unknown(res, err);
      if(!editor) return errHandle.notFound(res, err);
      editor.populate('albumIdList', function(err, editor) {
        if(err) return errHandle.unknown(res, err);
        editor.populate(photoIdListPopulate, function(err, editor) {
          if(err) return errHandle.unknown(res, err);
          res.send(editor);
        })
      })
    })
  }
  else {
    Editor
    .findOne()
    .populate('albumIdList')
    .exec(function(err, editor) {
      if(err) return errHandle.unknown(res, err);
      if(!editor) return errHandle.notFound(res, err);
      editor.populate(photoIdListPopulate, function(err, editor) {
        res.send(editor);
      })
    })
  }
}

//album
exports.albums= function(req, res) {
  var id = req.params.id;
  Album.findById(id)
  .populate(photoIdListPopulate)
  .exec(function(err, album) {
    if(err) return errHandle.unknown(res, err);
    if(!album) return errHandle.notFound(res, err);
    res.send(album);
  })
}

//photo
exports.photos= function(req, res) {
  var id = req.params.id;
  Photo.findById(id, function(err, photo) {
    if(err) return errHandle.unknown(res, err);
    if(!photo) return errHandle.notFound(res, err);
    res.send(photo);
  })
}

//labels
exports.labels = function(req, res) {
  var imageUrl = req.query.url;

  var options = {
    scriptPath: './python_modules/',
    args: ['AIzaSyC65J_eyq6ZmSK5s_OIFzH8srQsL17NdHs', imageUrl]
  };
  
  PythonShell.run('google_vision_label_detection.py', options, function (err, results) {
    if (err) return errHandle.unknown(res, err);
    results = JSON.parse(results);
    res.send(results);
  });
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
