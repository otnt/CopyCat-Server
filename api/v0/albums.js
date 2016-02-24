var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var helper = require("./helper.js");
var photoIdListPopulate = helper.photoIdListPopulate;
var errHandle = helper.errHandle;
var bodyParser = require('body-parser')

router.route('/:id')
.get(function(req, res, next) {
  var id = req.params.id;
  models.Album.findById(id)
  .populate(photoIdListPopulate)
  .exec(function(err, album) {
    if(err) return errHandle.unknown(res, err);
    if(!album) return errHandle.notFound(res, err);
    res.send(album);
  })
});

router.use('/', bodyParser.json());
router.route('/')
.post(function(req, res, next) {
  var fakeUserId;

  var getFakeUserId = function() {
    models.User.findOne(function(err, user) {
      if(err) return errHandle.unknown(res, err);
      fakeUserId = user._id;
      postAlbum();
    })
  }

  var postAlbum = function() {
    var data = req.body;
    var name = data.name;
    var imageUrl = data.imageUrl;
    var photoIdList = data.photoIdList;
    //var ownerId = fakeUserId;
    data.ownerId = fakeUserId;
    var tagList = data.tagList;

    if(!name) return errHandle.badRequest(res, "Need name for album");
    if(!imageUrl) return errHandle.badRequest(res, "Need imageUrl for album");

    models.Album.create(data, function(err, album) {
      if(err) return errHandle.unknown(res, err);
      res.statusCode = 201;
      res.send(album);
    });
  }

  getFakeUserId();
});

module.exports = router;
