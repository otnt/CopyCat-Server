const express = require('express');
const router = new express.Router();
const models = require('../../database/v0/models.js');
const bodyParser = require('body-parser');

/**
 * Helper functions
 */
const helper = require('./helper.js');
// const photoIdListPopulate = helper.photoIdListPopulate;
const errHandle = helper.errHandle;
const PromiseReject = helper.PromiseReject;
const assertExist = helper.assertExist;

/**
 * log objects and functions
 */
const logReq = helper.logReq;
const logRes = helper.logRes;

/**
 * Post a report
 */
router.use('/', bodyParser.json());
router.route('/')
.post((req, res) => {
  logReq(req.log, req);

  const body = req.body;
  if (!assertExist(body.content, 'content', res) ||
      !assertExist(body.content.contentType, 'content.contentType', res) ||
      !assertExist(body.content.contentId, 'content.contentId', res) ||
      !assertExist(body.reporter, 'reporter', res) ||
      !assertExist(body.reporter.ownerId, 'reporter.ownerId', res)
  ) {
    return null;
  }

  models.Report.create(req.body)
  .then((report) => {
    if (!report) {
      const msg = 'Create report failed';
      req.log.warn(msg);
      errHandle.badRequest(res, msg);
      throw new PromiseReject();
    }
  })
  .then((report) => {
    res.statusCode = 201;
    res.send(report);
    req.log.info({ report }, 'Report created');
    logRes(req.log, res);
  })

  // error handler
  .catch((err) => {
    if (!(err instanceof PromiseReject)) {
      req.log.error({ err }, 'Unknown error');
      errHandle.unknown(res, err);
    }
  });

  return null;
});

module.exports = router;
