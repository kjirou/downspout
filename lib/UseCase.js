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
   * @param {Object} context
   * @param {function(Object, ...*): *} logic
   */
  constructor(context, logic) {
    this._context = context;
    this._logic = logic;
  }

  /**
   * Execute prepared logics with its context
   * @param {...*} logicArgs - These are passed to the prepared logic
   * @return {Promise}
   */
  execute(...logicArgs) {
    let result;

    try {
      result = this._logic(this._context, ...logicArgs);
    } catch (error) {
      result = error;
    }

    return UseCase._promisifyResult(result);
  }
}

module.exports = UseCase;
