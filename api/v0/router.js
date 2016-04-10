'use strict';

var express = require("express");
var router = express.Router();

var promos = require("./promos.js");
var albums = require("./albums.js");
var photos = require("./photos.js");
var labels = require("./labels.js");
var timeline = require("./timeline.js");
var heartbeat = require("./heartbeat.js");
var feedback = require("./feedback.js");
var instagram = require("./socialmedia/instagram.js");

router.use(function(req, res, next) {
  console.log(Date.now() + " " + req.originalUrl);
  next();
});

router.use('/promos', promos);
router.use('/albums', albums);
router.use('/photos', photos);
router.use('/labels', labels);
router.use('/timeline', timeline);
router.use('/heartbeat', heartbeat);
router.use('/feedback', feedback);
router.use('/instagram', instagram);

module.exports = router;
