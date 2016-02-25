'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');

var helper = require("./helper.js");
var errHandle = helper.errHandle;

router.route('/:id')
.get(function(req, res) {
  var id = req.params.id;
  models.Photo.findById(id, function(err, photo) {
    if(err) return errHandle.unknown(res, err);
    if(!photo) return errHandle.notFound(res, err);
    res.send(photo);
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
      postPhoto();
    })
  }

  var postPhoto = function() {
    var data = req.body;
    var imageUrl = data.imageUrl;
    var referenceId = data.referenceId;
    //var ownerId = fakeUserId;
    data.ownerId = fakeUserId;
    var tagList = data.tagList;

    if(!imageUrl) return errHandle.badRequest(res, "Need imageUrl for photo");

    models.Photo.create(data, function(err, photo) {
      if(err) return errHandle.unknown(res, err);
      res.statusCode = 201;
      res.send(photo);
    });
  }

  getFakeUserId();
});

module.exports = router;
