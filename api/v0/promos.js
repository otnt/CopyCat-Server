'use strict';

var express = require("express");
var router = express.Router();
var models = require("../../database/v0/models.js");
var bodyParser = require('body-parser');

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
 * Promos/Hot
 * Hot is timeline of albums, indicating the most popular albums 
 * in recent period of time.
 */
router.route('/hot')
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

    models.Album
    .find(queryCondition.range)
    .find()
    .sort({_id:-1})
    .limit(queryCondition.count)
    .populate(photoIdListPopulate)
    .exec(function(err, albums){
      if(err) throw err;

      res.send(albums);
      logRes(req.log, res);
    })
  } catch (err) {
    req.log.error({err:err}, "Unknown error");
    errHandle.unknown(res, err);
  }
});

/**
 * Promos/Editor
 * Editor Choice is a collection of albums, selected by 
 * editors with similar topic, relation etc.
 */
router.route('/editor')
//get timeline of editors
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

    models.Editor
    .find(queryCondition.range)
    .sort({_id:-1})
    .limit(queryCondition.count)
    .populate('albumIdList')
    .exec(function(err, editors){
      if(err) throw err;

      res.send(editors);
      logRes(req.log, res);
    });
  } catch (err) {
    req.log.error({err:err}, "Unknown error");
    errHandle.unknown(res, err);
  }
})
.post(bodyParser.json(), function(req, res, next) {
  try{
    logReq(req.log, req);

    var name = req.body.name;
    var albumIdList = req.body.albumIdList;

    if(!name) {
      var msg = "Need name for editor choice";
      req.log.warn(msg);
      errHandle.badRequest(res, msg);
    }

    models.Editor.create(data, function(err, editor) {
      if(err) throw err;

      res.statusCode = 201;
      res.send(editor);
      req.log.info({editor:editor}, "Post new editor");
      logRes(req.log, res);
    });
  } catch (err) {
    req.log.error({err:err}, "Unknown error");
    errHandle.unknown(res, err);
  }
});

/**
 * Get a selected editor choice
 */
router.route('/editor/:id')
.get(function(req,res,next) {
  try{
    logReq(req.log, req);

    var id = req.params.id;

    models.Editor
    .findById(id)
    .populate('albumIdList')
    .exec(function(err, editor){
      if(err) throw err;
      if(!editor) {
        var msg = "Editor not found by id " + id;
        req.log.warn(msg);
        return errHandle.notFound(res, msg);
      }

      models.Album.populate(
        editor.albumIdList, 
        {path: 'photoIdList',},
        function(err, photo) {
          if(err) throw err;

          res.send(editor);
          req.log.info({editor:editor}, "Get editor");
          logRes(req.log, res);
      });
    });
  } catch (err) {
    req.log.error({err:err}, "Unknown error");
    errHandle.unknown(res, err);
  }
});

module.exports = router;
