'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");

var helper = require("./helper.js");
var photoIdListPopulate = helper.photoIdListPopulate;
var errHandle = helper.errHandle;

//hot
router.route('/hot')
.get(function(req, res, next) {
  var queryCondition = {};
  var maxId = req.query.maxId;
  var sinceId = req.query.sinceId;
  var count = req.query.count;
  if(count && isNaN(parseInt(count))) {
    errHandle.badRequest(res, "count should be numeric but is " + count);
    return;
  }
  count = count ? (count > 200 ? 200 : count) : 20;
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
  models.Album
  .find(queryCondition)
  .sort({_id:-1})
  .limit(parseInt(count))
  .populate(photoIdListPopulate)
  .exec(function(err, albums){
    if(err) {
      errHandle.unknown(res, err);
    }
    else{
      res.send(albums);
    }
  })
});

//editor's choice
router.route('/editor')
.get(function(req, res, next) {
  var id = req.query.id;
  if(id) {
    models.Editor.findById(id, function(err, editor){
      if(err) return errHandle.unknown(res, err);
      if(!editor) return errHandle.notFound(res, err);
      editor.populate('albumIdList', function(err, editor) {
        if(err) return errHandle.unknown(res, err);
        editor.populate(photoIdListPopulate, function(err, editor) {
          if(err) return errHandle.unknown(res, err);
          res.send(editor);
        })
      })
    })
  }
  else {
    models.Editor
    .findOne()
    .populate('albumIdList')
    .exec(function(err, editor) {
      if(err) return errHandle.unknown(res, err);
      if(!editor) return errHandle.notFound(res, err);
      editor.populate(photoIdListPopulate, function(err, editor) {
        res.send(editor);
      })
    })
  }
});

module.exports = router;
