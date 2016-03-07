'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');

var helper = require("./helper.js");
var errHandle = helper.errHandle;

//timeline
router.route('/')
.get(function(req, res, next) {
  var queryCondition = {};
  var maxId = req.query.maxId;
  var sinceId = req.query.sinceId;
  var count = req.query.count;
  if(count && isNaN(parseInt(count))) {
    errHandle.badRequest(res, "count should be numeric but is " + count);
    return;
  }
  count = count ? (count > 200 ? 200 : parseInt(count)) : 20;
  if(maxId) {
    if(!queryCondition._id) {
      queryCondition._id = {};
    }
    queryCondition._id['$lt'] = maxId;
  }
  if(sinceId) {
    if(!queryCondition._id) {
      queryCondition._id = {};
    }
    queryCondition._id['$gt'] = sinceId;
  }
  console.log("count " + count);
  models.Photo
  .find(queryCondition)
  .sort({_id:-1})
  .limit(count)
  .exec(function(err, photos){
    if(err) {
      errHandle.unknown(res, err);
    }
    else{
      res.send(photos);
    }
  })
});

module.exports = router;
