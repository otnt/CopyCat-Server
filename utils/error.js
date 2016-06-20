/**
 * A customized Error that is used in Promise chain.
 * So that we could throw this Error to break out of Promise chain.
 */
const ExtendableError = require('es6-error');

/**
 * Some self-defined extended error class.
 *
 * Usage:
 * SomePromise()
 * .then(() => {
 *   // Some thing wrong happens
 *   throw new MyError(sprintf('This is wrong %j.', errData), errData);
 * })
 * .catch((err) => {
 *   if (err instanceof SomeErrorYouWantToExplicitlyHandle) {
 *     ...
 *   } else {
 *     errorHandler.handle(err);
 *   }
 * });
 */
class ModelNotFoundError extends ExtendableError {
  constructor(message, errData) {
    super(message);
    this.errData = errData;
  }
}
module.exports.ModelNotFoundError = ModelNotFoundError;

/**
 * Error handling.
 * Given error type, respond object.
 */

function newErrorReturn(code, errMsg) {
  return { code, errMsg };
}

const errHandle = function errHandle() {};
errHandle.notFound = (res, err) => {
  res.status(404).send(newErrorReturn(404, sprintf('Not found: %j', err)));
};
errHandle.unknown = (res, err) => {
  res.status(500).send(newErrorReturn(500, sprintf('Unknown error: %j', err)));
};
errHandle.badRequest = (res, err) => {
  res.status(400).send(newErrorReturn(400, sprintf('Bad request: %j', err)));
};
// Error handler in catch block in promise chain.
errHandle.promiseCatchHanler = (res, log, err) => {
  if (err instanceof CastError) {
    log.warn({ err }, 'Cast error');
    errHandle.badRequest(res, err);
  } else if (!(err instanceof PromiseReject)) {
    log.error({ err }, 'Unknown error');
    errHandle.unknown(res, err);
  }
  return null;
};
module.exports.errHandle = errHandle;

