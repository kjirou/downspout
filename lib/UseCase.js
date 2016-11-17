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
   * @param {object} dependencies
   * @param {function} logic
   */
  constructor(dependencies, logic) {
    this._dependencies = dependencies;
    this._logic = logic;
  }

  /**
   * Execute prepared logics with its dependencies
   * @param {...*} args - Be passed to its logic
   * @return {Promise}
   */
  execute(...args) {
    let result;

    try {
      result = this._logic(this._dependencies, ...args);
    } catch (error) {
      result = error;
    }

    return UseCase._promisifyResult(result);
  }
}

module.exports = UseCase;
