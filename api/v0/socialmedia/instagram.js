'use strict';
var express = require("express");
var router = express.Router();
var config = require('../../../config.js');
const sprintf = require("sprintf-js").sprintf
var request = require('request');

/**
 * helper functions and objects
 */
var helper = require("../helper.js");
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
 * Login instagram.
 */
router.route('/login')
.get(function(req, res) {
    logReq(req.log, req);

    if(!req.query.code) {
        var msg = "Missing code in request";
        req.log.warn(msg);
        return errHandle.badRequest(res, msg);
    }

    request.post( 
        'https://api.instagram.com/oauth/access_token',
        { form: 
            { 
                client_id: config.instagram.clientId,
        client_secret : config.instagram.clientSecret,
        grant_type : config.instagram.grantType,
        redirect_uri : config.instagram.accessURL,
        code : req.query.code
            } 
        },
        function (err, response, body) {
            if(err) {
                var msg = "Unknown error during authorizing instagram";
                req.log.error({err:err}, msg);
                return errHandle.unknown(res, msg);
            }
            req.log.info({body:body}, "Get response from instagram server");
            res.json(body);
        }
        );
});

module.exports = router;
