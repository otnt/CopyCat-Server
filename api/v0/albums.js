'use strict'

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser')

/**
 * Helper functions
 */
var helper = require("./helper.js");
var photoIdListPopulate = helper.photoIdListPopulate;
var errHandle = helper.errHandle;
var PromiseReject = helper.PromiseReject;

/**
 * log objects and functions
 */
var logReq = helper.logReq;
var logRes = helper.logRes;
var logReqIdMiddleware = helper.logReqIdMiddleware;

/**
 * Add reqId to each request
 */
router.use(logReqIdMiddleware);

/**
 * Get a specific album.
 */
router.route('/:id')
.get(function(req, res, next) {
    logReq(req.log, req);

    //find album using id
    var id = req.params.id;
    models.Album.findById(id)
      //.populate(photoIdListPopulate)
    .populate({path: 'photoIdList', options: {limit : 10}})
    //assure album exist
    .then(function assureAlbumExist(album) {
      if(!album) {
        var msg = 'Album not found using id ' + id;
        req.log.warn(msg);
        errHandle.notFound(res, msg);
        throw new PromiseReject();
      }
      return album;
    })
    //respond
    .then(function respond(album) {
      res.send(album);
      req.log.info({album:album}, "Get album.");
      logRes(req.log, res);
    })
    .catch (function(err) {
      if(!(err instanceof PromiseReject)) {
        req.log.error({err:err}, "Unknown error");
        errHandle.unknown(res, err);
      }
    });
});

/**
 * Post a new album
 */
router.use('/', bodyParser.json());
router.route('/')
.post(function(req, res, next) {
  logReq(req.log, req);

  //find user
  models.User.findOne()

  //album infomation
  .then(function postAlbum(user) {
    var data = {};
    data.name = req.body.name;
    data.imageUrl = req.body.imageUrl;
    data.photoIdList = req.body.photoIdList;
    data.tagList = req.body.tagList;
    data.ownerId = user._id;

    return models.Album.create(data);
  })

  //assure album exist
  .then(function assureAlbumExist(album) {
    if(!album) {
      var msg = "Create album failed";
      req.log.warn(msg);
      errHandle.notFound(res, msg);
      throw new PromiseReject();
    }

    return album;
  })

  //respond
  .then(function respond(album) {
    res.statusCode = 201;
    res.send(album);
    req.log.info({album:album}, "Album created");
    logRes(req.log, res);
  })

  //error handler
  .catch(function(err) {
    if(!(err instanceof PromiseReject)) {
      req.log.error({err:err}, "Unknown error");
      errHandle.unknown(res, err);
    }
  });
});

module.exports = router;
