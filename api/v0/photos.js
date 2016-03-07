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

router.use(bodyParser.json({limit: '50mb'}));
router.route('/')
.post(function(req, res, next) {
  var buf = req.body.data;
  //if(!buf) return errHandle.badRequest(res, "Need image data");

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
    data.ownerId = fakeUserId;

    models.Photo.create(data, function(err, photo) {
      if(err) return errHandle.unknown(res, err);
      //put image info and data at same time
      if(buf) {
        uploadImage(''+photo._id, updatePhoto);
      }
      //first post image, then put data
      else {
        complete(null, photo);
      }
    });
  }

  var uploadImage = function(key, callback) {
    //get base64 data
    buf = new Buffer(buf, 'base64');

    var params = {
      Bucket: 'copycatimage',
      Key: key,
      ACL: 'public-read',
      Body: buf,
      ContentEncoding: 'base64',
      ContentLength: buf.length,
      ContentType: 'image/jpeg'
    };
    s3.upload(params)
    .send(function(err, data) {
      if (err) return errHandle.unknown(res, err);
      callback(data.key, data.Location);
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
module.exports = router;

