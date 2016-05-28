const express = require('express');
const router = new express.Router();
const models = require('../../database/v0/models.js');
const bodyParser = require('body-parser');
const config = require('../../config.js');

/**
 * Helper functions
 */
const helper = require('./helper.js');
// const photoIdListPopulate = helper.photoIdListPopulate;
const errHandle = helper.errHandle;
const PromiseReject = helper.PromiseReject;

/**
 * log objects and functions
 */
const logReq = helper.logReq;
const logRes = helper.logRes;
const logReqIdMiddleware = helper.logReqIdMiddleware;

/**
 * Add reqId to each request
 */
router.use(logReqIdMiddleware);

/**
 * Get a specific user.
 */
router.route('/:id')
.get((req, res) => {
  logReq(req.log, req);

  // find user using id
  const id = req.params.id;
  models.User.findById(id)
  // assure user exist
  .then((user) => {
    if (!user) {
      const msg = `User not found using id ${id}`;
      req.log.warn(msg);
      errHandle.notFound(res, msg);
      throw new PromiseReject();
    }
    return user;
  })
  // respond
  .then((user) => {
    res.send(user);
    req.log.info({ user }, 'Get user.');
    logRes(req.log, res);
  })
  .catch((err) => {
    if (!(err instanceof PromiseReject)) {
      req.log.error({ err }, 'Unknown error');
      errHandle.unknown(res, err);
    }
  });
});

/**
 * Post a new user
 */
router.use('/', bodyParser.json());
router.route('/')
.post((req, res) => {
  logReq(req.log, req);

  // User name must provided
  const name = req.body.name;
  if (!name) {
    const msg = 'Missing user name';
    req.log.info(msg);
    errHandle.badRequest(res, msg);
  }

  // Profile picture url could be default
  const profilePictureUrl = req.body.profilePictureUrl ?
    req.body.profilePictureUrl :
    config.anonymousProfilePictureUrl;
  if (!profilePictureUrl) {
    const msg = 'Missing user profile';
    req.log.info(msg);
    errHandle.badRequest(res, msg);
  }

  // User name must be unique
  models.User.find({ name })
  .then((user) => {
    if (user) {
      const msg = `User ${name} already exist`;
      req.log.info(msg);
      errHandle.badRequest(res, msg);
      throw new PromiseReject();
    }
    return null;
  })
  // Create user
  .then(() =>
    models.User.create({ name, profilePictureUrl })
  )
  // Assure user create succeed
  .then((user) => {
    if (!user) {
      const msg = 'Create user failed';
      req.log.warn(msg);
      errHandle.badRequest(res, msg);
      throw new PromiseReject();
    }
    return user;
  })
  // Respond
  .then((user) => {
    res.sendStatus(201);
    res.send(user);
    req.log.info({ user }, 'User created');
    logRes(req.log, res);
  })
  // Error handler
  .catch((err) => {
    if (!(err instanceof PromiseReject)) {
      req.log.error({ err }, 'Unknown error');
      errHandle.unknown(res, err);
    }
  });
});

module.exports = router;
