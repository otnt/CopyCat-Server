var nodemailer = require('nodemailer');
var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');

/**
 * helper functions and objects
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
 * Create reusable transporter object using the default SMTP transport
 */
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'copycatsvteam@gmail.com',
        pass: 'copycatteam'
    }
};
var transporter = nodemailer.createTransport(smtpConfig);

/**
 * Post a feedback
 */
router.use(bodyParser.json({limit: '5mb'}));//feed no more than 5mb
router.route('/')
.post(function(req, res) {
    logReq(req.log, req);

    if(!req.body.subject ||
        !req.body.contact||
        !req.body.text ) {
            var msg = "Missing field, need contact, subject, text";
            req.log.warn({req:req}, msg);
            return errHandle.badRequest(res, msg);
        }

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: req.body.contact, // sender address
    to: 'copycatsvteam@gmail.com', // list of receivers
    subject: req.body.subject, // Subject line
    text: req.body.text, // plaintext body
    html: req.body.text // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            var msg = "error when sending feedback email";
            req.log.error({err:err}, msg);
            return errHandle.unknown(res, msg);
        }
        req.log.info({info:info.response});
        return res.send(info.response);
    });
});

module.exports = router;

