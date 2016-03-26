'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');

/**
 * Helper functions.
 */
var helper = require("./helper.js");
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
 * Get timeline.
 * By default, it fetches at most 20 most recent timeline photos.
 *
 * Using count, maxId, sinceId, user could specify the photos
 * of different time, and number of photos, to be fetched.
 *
 * Specifically, this service will return photos within
 * (sinceId, maxId) of at most Min(200, count) photos
 */
router.route('/')
.get(function(req, res, next) {
  try{
    logReq(req.log, req);

    var queryCondition = helper.getTimelineStyleQuery({
        count:req.query.count, 
        maxId:req.query.maxId, 
        sinceId:req.query.sinceId
    },
    req.log,
    res);
    req.log.info({queryCondition: queryCondition}, 'Fetching timeline using query specification');

    //fetch timeline and respond
    models.Photo
    .find(queryCondition.range)
    .sort({_id:-1})
    .limit(queryCondition.count)
    .exec(function(err, photos){
      if(err) throw err;

      res.send(photos);
      logRes(req.log, res);
    })
  } catch (err) {
    req.log.error({err:err}, "Unknown error");
    errHandle.unknown(res, err);
  }
});

module.exports = router;
