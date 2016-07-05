const express = require('express');
const router = new express.Router();
const bodyParser = require('body-parser');
const Log = require('../../utils/logger.js');
const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');
const util = require('util');
const config = require('../../config');

/**
 * Error handler and self-defined error class.
 */
const errLib = require('../../utils/error.js');
const errorHandler = errLib.errorHandler;
const BadRequestError = errLib.BadRequestError;

/**
 * Bluebird made promise easy
 */
const Promise = require('bluebird');

const getAsync = Promise.promisify(request.get);
const postAsync = Promise.promisify(request.post);

/**
 * compress image
 */
const gm = require('gm').subClass({
  imageMagick: true,
});

router.use(bodyParser.json());
router.route('/')
.post((req, res) => {
  const log = new Log(req, res);
  log.logReq();

  const url = req.body.url;
  if (!url) {
    const msg = 'Missing url in post json.';
    return errorHandler.handle(new BadRequestError(msg), log, res);
  }

  // Get all image urls from given url.
  // For now, we consider these situations:
  // 1. <img src='...' />
  // 2. <div background-image: url('...')/>
  getAsync(url)
  .then((responseBody) => {
    const body = responseBody.body;
    const $ = cheerio.load(body);
    const imageUrls = [];

    // <img src='...' />
    // Suitable: Unsplash.com
    const images1 = $('img');
    for (let i = 0; i < images1.length; ++i) {
      imageUrls.push($(images1[i]).attr('src'));
    }

    // <div background-image: url('...')/>
    // Suitable: Flickr.com
    const images2 = $('div').filter((i, div) =>
      $(div).attr('background-image') !== null
    );
    console.log('image2', images2);

    log.info({ imageUrls }, 'Get crawl image urls.');
    return imageUrls;
  })
  // For each image, we download it, and get
  // size of the image.
  .map((imageUrl) =>
      getAsync(imageUrl)
      .then((responseBody) => {
        const body = responseBody.body;
        return new Promise((resolve) => {
          gm(body, 'img')
          .size((err, size) => {
            if (err) throw err;
            log.info({ imageUrl, size }, 'Got size of new photo.');
            resolve({ imageUrl, size, body });
          });
        });
      })
  , { concurrency: 3 })
  // We only care about images that are large enough.
  // Small images are very likely to be icon, navigation image etc.
  .filter((image) => {
    const size = image.size;
    return size.width >= 400 && size.height >= 300;
  })
  // Upload these images to S3.
  .map((image) => {
    // const size = image.size;
    // const imageUrl = image.imageUrl;
    // log.info({ imageUrl, size }, 'Crawl new image.');

    // return postAsync({
    //   url: util.format('http://localhost:%d/api/v1/photos', config.httpPort),
    //   json: {
    //     data: image.body,
    //   },
    // })
    // .then((responseBody) => responseBody.body.imageUrl);

    return '';
  })
  // Return results.
  .then((imageUrls) => {
    log.info(imageUrls, 'Crawl new images.');
    res.status(201).send({ images: imageUrls });
  })
  .catch((err) => errorHandler.handle(err, log, res));

  return null;
});

module.exports = router;
