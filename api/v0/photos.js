'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');

/**
 * AWS service
 */
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./crenditial.json');
var s3 = new AWS.S3();

/**
 * helper functions and objects
 */
var helper = require("./helper.js");
var assertHeader = helper.assertHeader;
var errHandle = helper.errHandle;
var PromiseReject = helper.PromiseReject;

/**
 * log objects and functions
 */
var log = helper.log;
var logReq = helper.logReq;
var logRes = helper.logRes;
var logReqIdMiddleware = helper.logReqIdMiddleware;

/**
 * compress image
 */
var fs = require('fs')
  , gm = require('gm').subClass({imageMagick: true});

/**
 * Add reqId to each request
 */
router.use(logReqIdMiddleware);

/**
 * Get a photo speficied by a photoId
 */
router.route('/:id')
.get(function(req, res) {
  logReq(req.log, req);

  var id = req.params.id;

  //find photo by id
  models.Photo.findById(id)
  //assure photo exists
  .then(function(photo) {
    if(!photo) {
      var msg = "Photo not found when get photo by id";
      req.log.warn(msg);
      errHandle.notFound(res, msg);
      throw new PromiseReject();
    }

    req.log.info({photo:photo}, "Photo found");
    return photo;
  })
  //respond
  .then((photo) => {
      res.send(photo);
      logRes(req.log, res);
  })
  //error handling
  .catch(function(err) {
    if(!(err instanceof PromiseReject)) {
      req.log.error({err:err}, "Unknown error");
      errHandle.unknown(res, err);
    }
  });
});

/**
 * Post a photo given base64 image data
 */
router.use(bodyParser.json({limit: '5mb'}));//photo should no more than 5mb
router.route('/')
.post(function(req, res, next) {
  logReq(req.log, req);

  assertHeader(req, res, req.log, 'content-type', 'application/json');

  //get data part, data is base64 encoded
  var data = req.body.data;
  if(!data) {
    req.log.info("Missing data part in request.");
    return errHandle.badRequest(res, 'Missing data part in request');
  }

  //get user id of the new photo
  var fakeUserId;
  var getFakeUserId = function() {
    models.User.findOne(function(err, user) {
      if(err) {
        req.log.error({err:err}, "Error when get user id.");
        return errHandle.unknown(res, err);
      }
      req.log.info({user:user}, "Found photo user.")

      fakeUserId = user._id;
      createPhoto();
    })
  }

  //create a new empty photo(i.e. without imageUrl) in database,
  //to get photoId
  var key;
  var createPhoto = function() {
    //create new photo
    var photo = {}
    photo.referenceId = req.body.referenceId;
    //photo.ownerId = req.body.ownerId;
    photo.tagList = req.body.tagList;
    photo.ownerId = fakeUserId;

    models.Photo.create(photo, function(err, photo) {
      if(err) {
        req.log.error({err:err}, "Error when create new photo.");
        return errHandle.unknown(res, err);
      }
      req.log.info({photo:photo}, "Created new empty photo.");

      key = '' + photo._id;
      compress();
    });
  }

  //compress photo data
  var compress = function() {
    data = new Buffer(data, 'base64');

    gm(data, 'img')
    .resize(800, 600)
    .quality(80)
    .toBuffer('JPG', function(err, buffer) {
      if(err) {
        req.log.error({err:err}, "Error when compress photo.");
        return errHandle.unknown(res, err);
      }
      req.log.info("Compressed new photo.");

      uploadImage(buffer);
    })
  }

  //upload new photo to AWS S3
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
      if (err) {
        req.log.error({err:err}, "Error when upload photo to S3.");
        return errHandle.unknown(res, err);
      }
      req.log.info("Uploaded new photo to S3");

      updatePhoto(data.Location);
    });
  }

  //get photo size info
  var updatePhoto = function(url) {
    gm(data, 'img')
    .size(function(err, size) {
      if(err) {
        req.log.error({err:err}, "Error when get size of photo.");
        return errHandle.unknown(res, err);
      }
      req.log.info("Got size of new photo.");

      models.Photo.findByIdAndUpdate(
        key,
        { $set: { imageUrl : url, width: size.width, height: size.height}},
        {new : true},//set true to return modified data
        complete
      );
    })
  }

  //update photo imageUrl, size info to database
  var complete = function(err, photo) {
    if(err) {
      req.log.error({err:err}, "Error when update new photo.");
      return errHandle.unknown(res, err);
    }
    req.log.info({photo:photo}, "Updated new photo.");

    res.statusCode = 201;
    res.send(photo);
    logRes(req.log, res);
  }

  getFakeUserId();
});

module.exports = router;

