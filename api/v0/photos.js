'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');

/**
 * Bluebird made promise easy
 */
var Promise = require("bluebird");

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

  //get user id uploading photo
  function getUserId() {
    return models.User.findOne()
    .then(function(user) {
      if(!user) {
        var msg = "User not found.";
        req.log.warn(msg);
        errHandle.notFound(res, msg);
        throw new PromiseReject();
      }

      req.log.info({user:user}, "Found photo user.")
      return user._id;
    });
  }

  //create a new empty photo(i.e. without imageUrl) in database to get photoId
  function createNewPhoto(id) {
    //create new photo
    var photo = {}
    photo.referenceId = req.body.referenceId;
    //photo.ownerId = req.body.ownerId;
    photo.tagList = req.body.tagList;
    photo.ownerId = id;

    return models.Photo.create(photo)
    .then(function(photo) {
      if(!photo) {
        var msg = "Create photo failed";
        req.log.warn(msg);
        errHandle.unknown(res, msg);
        throw new PromiseReject();
      }
    
      req.log.info({photo:photo}, "Created new empty photo.");
      return '' + photo._id;
    });
  }

  //compress photo data
  function compressPhoto() {
    var data = req.body.data;
    if(!data) {
      var msg = "Missing data part in request.";
      req.log.warn(msg);
      errHandle.badRequest(res, msg);
      throw new PromiseReject();
    }
    data = new Buffer(data, 'base64');

    return new Promise(function(resolve, reject) {
      gm(data, 'img').resize(800, 600).quality(80)
      .toBuffer('JPG', function(err, buffer) {
        if(err) throw err;

        req.log.info("Compressed new photo.");
        resolve(buffer);
      })
    })
  }

  //upload new photo to AWS S3
  function uploadPhoto(id, buffer) {
    var params = {
      Bucket: 'copycatimage',
      Key: id,
      ACL: 'public-read',
      Body: buffer,
      ContentLength: buffer.length,
      ContentType: 'image/jpeg'
    };

    return new Promise(function(resolve, reject) {
      s3.upload(params)
      .send(function(err, data) {
        if (err) throw err;

        req.log.info("Uploaded new photo to S3");
        resolve([id, data.Location]);
      });
    });
  }

  //get photo size info
  function getSize(data) {
    return new Promise(function(resolve, reject) {
      gm(data, 'img')
      .size(function(err, size) {
        if(err) throw err;

        req.log.info("Got size of new photo.");
        resolve(size);
      })
    });
  }

  //update photo in database
  function updatePhoto(idUrl, size) {
    var id = idUrl[0];
    var url = idUrl[1];
    return new Promise(function(resolve, reject) {
      models.Photo.findByIdAndUpdate(
        id,
        { $set: { imageUrl : url, width: size.width, height: size.height}},
        {new : true},//set true to return modified data
        function(err, photo) {
          if(err) throw err;

          req.log.info({photo:photo}, "Updated new photo.");
          resolve(photo);
        }
      );
    })
  }

  //respond
  function respond(photo) {
    res.statusCode = 201;
    res.send(photo);
    logRes(req.log, res);
  }

  /*
   * get user id -> new empty photo id -> 
   *                                    | -> upload to S3   --|
   * compress photo data --------------->                     |
   *                     -                                    | --> update photo in database -> respond
   *                       -                                  |
   *                         -                                |
   *                           ------------> get photo size --|
   */
  var promiseNewPhotoId = getUserId().then(createNewPhoto);
  var promiseCompressPhoto = compressPhoto();
  Promise.join(
    Promise.join(
      promiseNewPhotoId, 
      promiseCompressPhoto, 
      uploadPhoto),

    promiseCompressPhoto.then(getSize),

    updatePhoto
  )
  .then(respond)
  .catch(function(err) {
    if(!(err instanceof PromiseReject)) {
      req.log.error({err:err}, "Unknown error");
      errHandle.unknown(res, err);
    }
  })

});

module.exports = router;

