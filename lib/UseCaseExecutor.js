const EventEmitter = require('events').EventEmitter;
const Rx = require('rxjs/Rx');

const UseCase = require('./UseCase');

/**
 * @fires UseCaseExecutor#resolved
 * @fires UseCaseExecutor#rejected
 */
class UseCaseExecutor extends EventEmitter {
  /**
   * @param {Object.<string, function>} useCaseLogics
   * @param {Object} context
   * @return {Object.<string, UseCase>}
   */
  static _bindUseCaseLogics(useCaseLogics, context) {
    const boundUseCases = {};

    Object.keys(useCaseLogics).forEach(useCaseName => {
      boundUseCases[useCaseName] =
        new UseCase(Object.assign({}, context), useCaseLogics[useCaseName]);
    });

    return boundUseCases;
  }

  static _toUseCaseEventName(eventName) {
    return 'useCase:' + eventName;
  }

  /**
   * @param {Object.<string, function>} useCaseLogics
   * @param {Object} context
   */
  constructor(useCaseLogics, context) {
    super();

    const modifiedContext = Object.assign({}, context, {
      executor: {
        next: this.acceptExecutionQuery.bind(this),
      },
    });
    const boundUseCases = UseCaseExecutor._bindUseCaseLogics(useCaseLogics, modifiedContext);

    // Conmbine executions of events into one promise chain
    Rx.Observable
      .fromEventPattern(
        (streamHandler) => {
          Object.keys(useCaseLogics).sort().forEach(useCaseName => {
            this.on(UseCaseExecutor._toUseCaseEventName(useCaseName), (...args) => {
              streamHandler({
                useCaseName,
                args,
              });
            });
          });
        },
        // TODO: Remove handlers
        (streamHandler) => {
        }
      )
      .concatMap(({ useCaseName, args }) => {
        const promise = new Promise((resolve, reject) => {
          boundUseCases[useCaseName].execute(...args)
            .then(result => {
              resolve({
                useCaseName,
                context,
                args,
                result,
              });
            })
            .catch(error => {
              reject({
                useCaseName,
                context,
                args,
                error,
              });
            })
          ;
        });
        return Rx.Observable.fromPromise(promise);
      })
      .subscribe(
        (result) => {
          this.emit('resolved', result);
        },
        (result) => {
          this.emit('rejected', result);
        }
      )
    ;
  }

  /**
   * Accept a use-case execution query, and try to execute it
   *
   * Use-case logics are executed in the order in which they are requested,
   *   and then the completed execution emits a "resolved" event.
   *
   * If any use-case execution throws a error
   *   then rest queries are canceled immediately with emitting a "rejected" event.
   *
   * @param {string} useCaseName
   * @param {...} useCaseArgs
   */
  acceptExecutionQuery(useCaseName, ...useCaseArgs) {
    this.emit(UseCaseExecutor._toUseCaseEventName(useCaseName), ...useCaseArgs);
  }
}

module.exports = UseCaseExecutor;
