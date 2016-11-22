class UseCase {
  static _promisifyResult(result) {
    let promise;

    if (result instanceof Promise) {
      promise = result;
    } else if (result instanceof Error) {
      promise = Promise.reject(result);
    } else {
      promise = Promise.resolve(result);
    }

    return promise;
  }

  /**
   * @param {object} context
   * @param {function} logic
   */
  constructor(context, logic) {
    this._context = context;
    this._logic = logic;
  }

  /**
   * Execute prepared logics with its context
   * @param {...*} args - Be passed to its logic
   * @return {Promise}
   */
  execute(...args) {
    let result;

    try {
      result = this._logic(this._context, ...args);
    } catch (error) {
      result = error;
    }

    return UseCase._promisifyResult(result);
  }
}

module.exports = UseCase;
