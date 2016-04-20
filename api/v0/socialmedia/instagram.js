const express = require('express');
const router = new express.Router();
const config = require('../../../config.js');
const request = require('request');

/**
 * helper functions and objects
 */
const helper = require('../helper.js');
const errHandle = helper.errHandle;

/**
 * log objects and functions
 */
const logReq = helper.logReq;
const logReqIdMiddleware = helper.logReqIdMiddleware;

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
        redirect_uri : config.instagram.redirectURL,
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
            res.send(body);
        }
        );
});

module.exports = router;
