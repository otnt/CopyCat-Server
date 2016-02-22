'use strict';
var db = require("./database/database.js");
var User = require("./database/user.js");
var Photo = require("./database/photo.js");
var Album = require("./database/album.js");
var Editor = require("./database/editor.js");

var prefetchPhotoNumber = 10;
var photoIdListPopulate = {
  path: 'photoIdList',
  select: '_id imageUrl ownerId',
  options: {limit : prefetchPhotoNumber}
}

//hot
exports.promosHot = function(req, res) {
  Album
  .find()
  .populate(photoIdListPopulate)
  .exec(function(err, albums){
    res.send(albums);
  })
}

//editor's choice
exports.promosEditor = function(req, res) {
  var id = req.params.id;
  if(id) {
    Editor.findById(id, function(err, editor){
      editor.populate('albumIdList', function(err, editor) {
        editor.populate(photoIdListPopulate, function(err, editor) {
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
      editor.populate(photoIdListPopulate, function(err, editor) {
        res.send(editor);
      })
    })
  }
}

//album
exports.albums= function(req, res) {
  var id = req.params.id;
  if(id) {
    Album.findById(id)
    .populate(photoIdListPopulate)
    .exec(function(err, album) {
      res.send(album);
    })
  }
  else {
    res.send("no id");
  }
}

//photo
exports.photos= function(req, res) {
  var id = req.params.id;
  if(id) {
    Photo.find({_id: id}, function(err, photo) {
      res.send(photo);
    })
  }
  else {
    res.send("no id");
  }
}
