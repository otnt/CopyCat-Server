const express = require('express');
const router = new express.Router();
const config = require('../../../config.js');
const bodyParser = require('body-parser');
const request = require('request');
const util = require('util');
const helper = require('../helper.js');

/**
 * helper functions and objects
 */
const errHandle = helper.errHandle;
const PromiseReject = errHandle.PromiseReject;

/**
 * compress image
 */
// const gm = require('gm').subClass({
//   imageMagick: true,
// });

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
 * Return relative photo given a user selected photo.
 */
router.use(bodyParser.json({
  limit: '5mb',
}));
router.route('/')
.post((req, res) => {
  logReq(req.log, req);

  // data is required
  const data = req.body.data;
  if (!data) {
    const msg = 'Missing data part in request.';
    req.log.error(msg);
    return errHandle.badRequest(res, msg);
  }
  // data = new Buffer(data, 'base64');

  // get photo size info
  // function getSize() {
  //   return new Promise((resolve) => {
  //     gm(data, 'img')
  //     .size((err, size) => {
  //       if (err) throw err;
  //       req.log.info(size, 'Got size of new photo.');
  //       resolve(size);
  //     });
  //   });
  // }

  function compressPhoto() {
    /*
    let width = size.width;
    let height = size.height;
    if (width > config.maxWidth || height > config.maxHeight) {
      return new Promise((resolve) => {
        const widthScale = width / 800;
        const heightScale = height / 800;
        const scale = Math.max(widthScale, heightScale);
        width = Math.round(width / scale);
        height = Math.round(height / scale);

        gm(data, 'test.jpg')
        .setFormat('jpg')
        .resize(width, height)
        .toBuffer((err, buffer) => {
          if (err) throw err;
          req.log.info({ width, height }, 'Compressed new photo.');
          resolve(buffer.toString('utf-8'));
        });
      });
    }
    */
    return new Promise((resolve) => {
      resolve(data);
    });
  }

  const getLabels = function getLabels(d) {
    req.log.info('Requesting label from Google Cloud Vision API');

    return new Promise((resolve) => request({
      url: util.format('https://vision.googleapis.com/v1/images:annotate?key=%s', config.cloudVisionApiKey),
      method: 'POST',
      json: {
        requests: [{
          image: { content: d },
          features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
        }],
      },
    }, (err, response, body) => {
      const labels = [];
      const labelsAnnotations = body.responses[0].labelAnnotations;
      if (labelsAnnotations.length === 0) {
        const msg = 'No annotation found';
        req.log.info(msg);
        res.send({});
        throw new PromiseReject();
      }
      // Definitely put first description in
      labels.push(labelsAnnotations[0].description);
      // For following description, only puts if score higher than 0.9
      for (let i = 1; i < labelsAnnotations.length; i++) {
        if (labelsAnnotations[i].score > 0.9) {
          labels.push(labelsAnnotations[i].description);
        }
      }
      resolve(labels);
    }));
  };

  const getRelatedPhoto = function getRelatedPhoto(labels) {
    req.log.info('Request photos from unsplash.com');
    const labelString = labels.join(',').replace(/\s+/g, '%20');
    return new Promise((resolve) => request({
      url: util.format('https://api.unsplash.com/photos/search?query=%s&client_id=6aeca0a320939652cbb91719382190478eee706cdbd7cfa8774138a00dd81fab', labelString),
      method: 'GET',
    }, (err, response, body) => {
      const d = JSON.parse(body);
      const photos = [];
      for (let i = 0; i < d.length; i++) {
        const newImage = {};
        newImage.url = d[i].urls.regular;
        newImage.categories = [];
        for (let j = 0; j < d[i].categories.length; j++) {
          newImage.categories.push(d[i].categories[j].title);
        }
        photos.push(newImage);
      }
      resolve({ labels, photos });
    }));
  };

  // respond
  function respond(d) {
    res.status(200);
    res.send(d);
    logRes(req.log, res);
  }

  // getSize()
  // .then(compressPhoto)
  compressPhoto()
  .then(getLabels)
  .then(getRelatedPhoto)
  .then(respond)
  .catch((err) => errHandle.promiseCatchHanler(res, req.log, err));

  return null;
});

module.exports = router;
