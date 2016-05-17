'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');
var config = require('../../config.js');

/**
 * Bluebird made promise easy
 */
var Promise = require("bluebird");

/**
 * AWS service
 */
var AWS = require('aws-sdk');
AWS.config = new AWS.Config(config.credential);
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
var fs = require('fs'),
    gm = require('gm').subClass({
        imageMagick: true
    });

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
            .populate({path: 'ownerId'})
            //assure photo exists
            .then(function(photo) {
                if (!photo) {
                    var msg = "Photo not found when get photo by id";
                    req.log.warn(msg);
                    errHandle.notFound(res, msg);
                    throw new PromiseReject();
                }

                req.log.info({
                    photo: photo
                }, "Photo found");
                return photo;
            })
            //respond
            .then((photo) => {
                res.send(photo);
                logRes(req.log, res);
            })
            //error handling
            .catch(function(err) {
                if (!(err instanceof PromiseReject)) {
                    req.log.error({
                        err: err
                    }, "Unknown error");
                    errHandle.unknown(res, err);
                }
            });
    });

/**
 * Post a photo given base64 image data
 */
router.use(bodyParser.json({
    limit: '5mb'
})); //photo should no more than 5mb
router.route('/')
    .post(function(req, res, next) {
   logReq(req.log, req);

     assertHeader(req, res, req.log, 'content-type', 'application/json');

     // data is required
     var data = req.body.data;
     if (!data) {
         var msg = "Missing data part in request.";
         req.log.error(msg);
         return errHandle.badRequest(res, msg);
     }
     data = new Buffer(data, 'base64');

     // ownerId is required
     var userPromise = null;
     var ownerId = req.body.ownerId;
     // If app provide ownerId, then search for the user
     if(ownerId) {
         // assert user exists
         userPromise = 
           models.User.findById(ownerId).then((user) => {
               if(!user) {
                  var msg = "User does not exist";
                  req.log.error(msg);
                  errHandle.badRequest(res, msg);
                  throw new PromiseReject();
               }

               return null;
           });
     }
     // Otherwise, use anonymous user
     else {
         userPromise = 
           models.User.find({ 'name' : 'anonymous' }).then((user) => {
               ownerId = user[0]._id;
               return null;
           });
     }
     
     //get photo size info
     function getSize() {
         return new Promise(function(resolve, reject) {
             gm(data, 'img')
                 .size(function(err, size) {
                     if (err) throw err;

                     req.log.info(size, "Got size of new photo.");
                     resolve(size);
                 })
         });
     }

     function compressPhoto(size) {
         let width = size.width;
         let height = size.height;
         if(width > config.maxWidth || height > config.maxHeight) {
             return new Promise(function(resolve, reject) {
                 const widthScale = width / 800;
                 const heightScale = height / 800;
                 const scale = Math.max(widthScale, heightScale);
                 width = Math.round(width / scale);
                 height = Math.round(height / scale);

                 gm(data, 'test.jpg')
                     .setFormat('jpg')
                     .resize(width, height)
                     .toBuffer(function(err, buffer) {
                         if (err) throw err;

                         size = {width, height};
                         req.log.info(size, "Compressed new photo.");
                         resolve({ size, buffer });
                     });
             });
         }
         else {
             return new Promise(function(resolve, reject) {
                 gm(data, 'test.jpg')
                 .toBuffer(function(err, buffer) {
                     if(err) throw err;

                     req.log.info("No need to compress photo");
                     resolve({ size, buffer });
                 });
             });
         }
     }

     //create a new empty photo(i.e. without imageUrl) in database to get photoId
     function createNewPhoto(sizeBuffer) {
         var size = sizeBuffer.size;
         var buffer = sizeBuffer.buffer;

         //create new photo
         var photo = {}
         photo.referenceId = req.body.referenceId;
         photo.ownerId = ownerId;
         photo.tagList = req.body.tagList;

         return models.Photo.create(photo)
             .then(function(photo) {
                 if (!photo) {
                     var msg = "Create photo failed";
                     req.log.warn(msg);
                     errHandle.unknown(res, msg);
                     throw new PromiseReject();
                 }

                 req.log.info({
                     photo: photo
                 }, "Created new empty photo.");
                 var id = '' + photo._id;
                 return { id, size, buffer };
             });
     }

     //upload new photo to AWS S3
     function uploadPhoto(idSizeBuffer) {
         const id = idSizeBuffer.id;
         const size = idSizeBuffer.size;
         const buffer = idSizeBuffer.buffer;

         var params = {
             Bucket: config.s3ImageBucket.name,
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
                     var url = data.Location;
                     resolve({id, url, size});
                 });
         });
     }
     
     //update photo in database
     function updatePhoto(idUrlSize) {
         const id = idUrlSize.id;
         const url = idUrlSize.url;
         const size = idUrlSize.size;

         return new Promise(function(resolve, reject) {
             models.Photo.findByIdAndUpdate(
                 id, {
                     $set: {
                         imageUrl: url,
                         width: size.width,
                         height: size.height
                     }
                 }, {
                     new: true
                 }, //set true to return modified data
                 function(err, photo) {
                     if (err) throw err;

                     req.log.info({
                         photo: photo
                     }, "Updated new photo.");
                     resolve(photo);
                 }
             );
         })
     }

     function populatePhoto(photo) {
         return models.Photo.populate(photo, {path: 'ownerId', model: 'User'});
     }

     //respond
     function respond(photo) {
         res.statusCode = 201;
         res.send(photo);
         logRes(req.log, res);
     }

     userPromise
     .then(getSize)
     .then(compressPhoto)
     .then(createNewPhoto)
     .then(uploadPhoto)
     .then(updatePhoto)
     .then(populatePhoto)
     .then(respond)
     .catch(function(err) {
         if (!(err instanceof PromiseReject)) {
             req.log.error({
                 err: err
             }, "Unknown error");
             errHandle.unknown(res, err);
         }
     })

    });

module.exports = router;
