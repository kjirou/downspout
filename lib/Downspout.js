const EventEmitter = require('events').EventEmitter;

const EventRouter = require('./EventRouter');
const UseCaseExecutor = require('./UseCaseExecutor');

const EVENT_NAMES = {
  USE_CASE_EXECUTION_RESOLVED: 'execution:resolved',
  USE_CASE_EXECUTION_REJECTED: 'execution:rejected',
};

/**
 * @fires Downspout#useCase:resolved
 * @fires Downspout#useCase:rejected
 */
class Downspout extends EventEmitter {
  /**
   * For the development of this module
   * @return {boolean}
   */
  static _getDefaultIsNoisy() {
    return false;
  }

  /**
   * @param {Object.<string, Function>} useCaseLogics
   * @param {Object} [options]
   * @param {?Object.<string, Array>} [options.routes]
   * @param {?Object.<string, *>} [options.context]
   * @param {?Object.<string, boolean>} [options.isNoisy]
   */
  constructor(useCaseLogics, options = {}) {
    super();

    const routes = 'routes' in options ? options.routes : null;
    const context = 'context' in options ? options.context : {};
    const isNoisy = 'isNoisy' in options ? options.isNoisy : Downspout._getDefaultIsNoisy();

    this._useCaseExecutor = new UseCaseExecutor(useCaseLogics, context);
    this._useCaseExecutor.on('resolved', situation => {
      this.emit(EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, situation);
    });
    this._useCaseExecutor.on('rejected', situation => {
      if (isNoisy) {
        console.error(situation.error);
      }
      this.emit(EVENT_NAMES.USE_CASE_EXECUTION_REJECTED, situation);
    });

    this._eventRouter = null;
    if (routes) {
      this._eventRouter = new EventRouter(routes);
      // TODO: Throw an error if routes included undefined use-case name
    }
  }

  /**
   * Execute a use-case
   * <p>It is executed asynchronously, and an event handler emits after execution.</p>
   * <p>If another use case is already running, this execution query is added to the queue.</p>
   * @param {string} useCaseName
   * @param {...*} useCaseArgs
   */
  execute(useCaseName, ...useCaseArgs) {
    this._useCaseExecutor.acceptExecutionQuery(useCaseName, ...useCaseArgs);
  }

  /**
   * Generate a bound `execute` method to carry into any view library
   * <p>For example, set it to the context of React.Component</p>
   * @return {Function}
   */
  generateExecutor() {
    return this.execute.bind(this);
  }

  /**
   * Execute a use-case via routes
   * @see Downspout.execute
   * @param {string} eventName
   * @param {...*} payloads
   */
  dispatch(eventName, ...payloads) {
    if (!this._eventRouter) {
      throw new Error('Routes are not passed');
    }
    const query = this._eventRouter.eventDataToUseCaseExecutionQuery(eventName, ...payloads);
    this.execute(...query);
  }

  /**
   * Generate a bound `dispatch` method to carry into any view library
   * @see Downspout.generateExecutor
   * @return {Function}
   */
  generateDispatcher() {
    return this.dispatch.bind(this);
  }
}

Object.assign(Downspout, {
  EVENT_NAMES,
});

module.exports = Downspout;
