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
    this._boundUseCases = UseCaseExecutor._bindUseCaseLogics(useCaseLogics, modifiedContext);

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
        const useCase = this._boundUseCases[useCaseName];
        const baseSituation = {
          useCaseName,
          // Pass the original `context` rather than the `modifiedContext`
          context: Object.assign({}, context),
          args,
        };

        // TODO: beforeUseCase middlewares

        const promise = new Promise((resolve, reject) => {
          useCase.execute(...args)
            .then(result => {
              resolve(Object.assign(baseSituation, { result }));
            })
            .catch(error => {
              reject(Object.assign(baseSituation, { error }));
            })
          ;
        });

        // TODO: afterUseCase middlewares

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
    if (Object.keys(this._boundUseCases).indexOf(useCaseName) === -1) {
      throw new Error(`"The "${useCaseName}" use-case does not exist`);
    }
    this.emit(UseCaseExecutor._toUseCaseEventName(useCaseName), ...useCaseArgs);
  }
}

module.exports = UseCaseExecutor;
