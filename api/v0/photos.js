'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./crenditial.json');
var s3 = new AWS.S3();

var helper = require("./helper.js");
var errHandle = helper.errHandle;
var assertHeader = helper.assertHeader;

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
})
.put(bodyParser.json({limit: '5mb'}), 
function(req, res, next) {
  if(!assertHeader(req.get('content-type'), 'application/json', 'content-type', res)) return;

  var id = req.params.id;
  var dataBase64 = req.body.dataBase64;
  if(!dataBase64) return errHandle.badRequest(res, "Need image data");
  var buf = new Buffer(dataBase64, 'base64');

  var compress = function() {
    gm(buf, 'img')
    .resize(800, 600)
    .quality(80)
    .toBuffer('JPG',function (err, buffer) {
      if (err) return errHandle.unknown(res, err);
      uploadImage(buffer);
    });
  }

  var uploadImage = function(buffer) {
    var params = {
      Bucket: 'copycattest',
      Key: id,
      ACL: 'public-read',
      Body: buffer,
      ContentType: 'image/jpeg'
    };
    s3.upload(params)
    .send(function(err, data) {
      if (err) return errHandle.unknown(res, err);
      updatePhoto(data.Location);
    });
  }

  //get image size info and update photo
  var updatePhoto = function(url) {
    gm(buf, 'img')
    .size(function(err, size){
      if(err) return errHandle.unknown(res, err);
      models.Photo.findByIdAndUpdate(
        id, 
        { $set: { imageUrl : url, width : size.width, height : size.height}},
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

  //compress -> upload image to s3 -> update photo in database -> complete
  compress();
});

router.route('/')
.post(bodyParser.json(),
function(req, res, next) {
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
      res.statusCode = 201;
      res.send(photo);
    });
  }

  //get user id -> post photo without image data
  getFakeUserId();
});
module.exports = router;

