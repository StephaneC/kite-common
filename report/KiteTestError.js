/**
 * Class: KiteTestError
 * Extends: Error
 * Description: Create an error with a status: failed|broken|passed|skipped
 */
class KiteTestError extends Error{
  constructor(status, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KiteTestError);
    }
    this.name = 'KiteTestError';
    this.status = status;
  }
}

module.exports = KiteTestError;