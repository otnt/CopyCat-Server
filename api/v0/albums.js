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
  try{
    logReq(req.log, req);

    var id = req.params.id;

    models.Album.findById(id)
    .populate(photoIdListPopulate)
    .exec(function(err, album) {
      if(err) throw err;
      if(!album) {
        var msg = 'Album not found using id ' + id;
        req.log.warn(msg);
        return errHandle.notFound(res, msg);
      }

      res.send(album);
      req.log.info({album:album}, "Get album.");
      logRes(req.log, res);
    })
  } catch (err) {
    req.log.error({err:err}, "Unknown error");
    errHandle.unknown(res, err);
  }
});

/**
 * Post a new album
 */
router.use('/', bodyParser.json());
router.route('/')
.post(function(req, res, next) {

  //get the user id
  function getUserId() {
    return models.User.findOne
    .then(function(user) {
      return user._id;
    })
  }

  //album infomation
  function postAlbum(id) {
    var data = {};
    data.name = req.body.name;
    data.imageUrl = req.body.imageUrl;
    data.photoIdList = req.body.photoIdList;
    data.tagList = req.body.tagList;
    data.ownerId = id;

    models.Album.create(data)
    .then(function(album) {
      if(!album) {
        var msg = "Create album failed";
        req.log.warn(msg);
        errHandle.notFound(res, msg);
        throw new PromiseReject();
      }

      res.statusCode = 201;
      res.send(album);
      req.log.info({album:album}, "Album created");
      logRes(req.log, res);
    })
  }

  getUserId().then(postAlbum);
});

module.exports = router;
