var nodemailer = require('nodemailer');
var express = require("express");
var router = express.Router();

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
var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

/**
 * Get a photo speficied by a photoId
 */
router.route('/')
.get(function(req, res) {
    logReq(req.log, req);

    req.log.trace(req.query);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"pufan jiang" <jiangpufan@gmail.com>', // sender address
    to: 'jiangpufan@gmail.com', // list of receivers
    subject: 'Feedback', // Subject line
    text: '', // plaintext body
    html: '<b></b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
});

module.exports = router;

