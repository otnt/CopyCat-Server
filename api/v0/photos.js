'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./crenditial.json');
var s3 = new AWS.S3();

var base64 = require('base64-stream');
var zlib = require('zlib');

var helper = require("./helper.js");
var assertHeader = helper.assertHeader;
var errHandle = helper.errHandle;

var fs = require('fs')
  , gm = require('gm').subClass({imageMagick: true});

router.route('/:id')
.get(function(req, res) {
  var id = req.params.id;
  models.Photo.findById(id, function(err, photo) {
    if(err) return errHandle.unknown(res, err);
    if(!photo) return errHandle.notFound(res, err);
    res.send(photo);
  })
});

router.route('/:id/stream')
.put(function(req, res, next) {
  var id = req.params.id;
  var fakeUserId;
  var getFakeUserId = function() {
    models.User.findOne(function(err, user) {
      if(err) return errHandle.unknown(res, err);
      fakeUserId = user._id;
      uploadImage(id, updatePhoto);
    })
  }

  var uploadImage = function(id, callback) {
    var params = {
      Bucket: 'copycatimage',
      Key: id,
      ACL: 'public-read',
      Body: req.pipe(base64.decode()).pipe(zlib.createGzip()),
      ContentEncoding: 'gzip',
      ContentType: 'image/jpeg'
    };
    s3.upload(params)
    .send(function(err, data) {
      if (err) return errHandle.unknown(res, err);
      callback(id, data.Location);
    });
  }

  var updatePhoto = function(id, url) {
    models.Photo.findByIdAndUpdate(
      id, 
      { $set: { imageUrl : url}},
      {new : true},//set true to return modified data
      complete
    );
  }

  var complete = function(err, photo) {
    if(err) return errHandle.unknown(res, err);
    res.statusCode = 201;
    res.send(photo);
  }

  getFakeUserId();
});

router.use(bodyParser.json({limit: '5mb'}));
router.route('/')
.post(function(req, res, next) {
  assertHeader(req, res, 'content-type', 'application/json');

  var data = req.body.data;
  if(!data) return errHandle.badRequest(res, 'missing data part in request');

  var fakeUserId;
  var getFakeUserId = function() {
    models.User.findOne(function(err, user) {
      if(err) return errHandle.unknown(res, err);
      fakeUserId = user._id;
      postPhoto();
    })
  }

  var key;
  var postPhoto = function() {
    var photo = req.body;
    photo.ownerId = fakeUserId;
    delete photo.data

    models.Photo.create(photo, function(err, photo) {
      if(err) return errHandle.unknown(res, err);
      key = '' + photo._id;
      compress();
    });
  }

  var compress = function() {
    //get base64 data
    data = new Buffer(data, 'base64');

    gm(data, 'img')
    .resize(800, 600)
    .quality(80)
    .toBuffer('JPG', function(err, buffer) {
      if(err) return errHandle.unknown(res, err);
      uploadImage(buffer);
    })
  }

  var uploadImage = function(buffer) {
    var params = {
      Bucket: 'copycatimage',
      Key: key,
      ACL: 'public-read',
      Body: buffer,
      ContentLength: buffer.length,
      ContentType: 'image/jpeg'
    };
    s3.upload(params)
    .send(function(err, data) {
      if (err) return errHandle.unknown(res, err);
      updatePhoto(data.Location);
    });
  }

  var updatePhoto = function(url) {
    gm(data, 'img')
    .size(function(err, size) {
      if(err) return errHandle.unknown(res, err);
      models.Photo.findByIdAndUpdate(
        key,
        { $set: { imageUrl : url, width: size.width, height: size.height}},
        {new : true},//set true to return modified data
        complete
      );
    })
  }

  var complete = function(err, photo) {
    if(err) return errHandle.unknown(res, err);
    res.statusCode = 201;
    res.send(photo);
  }

  getFakeUserId();
});
module.exports = router;

