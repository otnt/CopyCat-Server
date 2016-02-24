'use strict';

var express = require("express");
var router = express.Router();
var PythonShell = require('python-shell');

var helper = require("./helper.js");
var errHandle = helper.errHandle;

//labels
router.route("/")
.get(function(req, res) {
  var imageUrl = req.query.url;

  var options = {
    //script path is from entry of node.js program, which is dir of server.js
    scriptPath: './python_modules/',
    args: ['AIzaSyC65J_eyq6ZmSK5s_OIFzH8srQsL17NdHs', imageUrl]
  };
  
  PythonShell.run('google_vision_label_detection.py', options, function (err, results) {
    if (err) return errHandle.unknown(res, err);
    results = JSON.parse(results);
    res.send(results);
  });
});

module.exports = router;
