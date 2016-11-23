const assert = require('assert');

const UseCaseExecutor = require('../../lib/UseCaseExecutor');


describe('lib/UseCaseExecutor', () => {
  const _handleRejectedEventForDebugging = (executor) => {
    executor.on('rejected', (situation) => {
      console.error(situation);
    });
  };

  describe('acceptExecutionQuery', () => {
    let executor;

    context('simple case', () => {
      beforeEach(() => {
        executor = new UseCaseExecutor({
          runResolvedLogic: () => {
            return 'RESOLVED';
          },
          runRejectedLogic: () => {
            throw new Error('REJECTED');
          },
        }, { x: 1 });
      });

      it('can execute single resolved use-case logic', done => {
        _handleRejectedEventForDebugging(executor);

        executor.on('resolved', (situation) => {
          assert.strictEqual(situation.result, 'RESOLVED');
          assert.strictEqual(situation.useCaseName, 'runResolvedLogic');
          assert.strictEqual(situation.context.executor, undefined);
          done();
        });
        executor.acceptExecutionQuery('runResolvedLogic');
      });

      it('can execute single rejected use-case logic', done => {
        executor.on('rejected', (situation) => {
          assert.strictEqual(situation.error.message, 'REJECTED');
          assert.strictEqual(situation.useCaseName, 'runRejectedLogic');
          assert.strictEqual(situation.context.executor, undefined);
          done();
        });
        executor.acceptExecutionQuery('runRejectedLogic');
      });
    });

    context('use args', () => {
      beforeEach(() => {
        executor = new UseCaseExecutor({
          sum: ({}, ...args) => {
            return args.reduce((m, v) => m + v, 0);
          },
        }, {});
        _handleRejectedEventForDebugging(executor);
      });

      it('can pass args to use-case logic', done => {
        executor.on('resolved', ({ result, args }) => {
          assert.strictEqual(result, 6);
          assert.deepStrictEqual(args, [1, 2, 3]);
          done();
        });
        executor.acceptExecutionQuery('sum', 1, 2, 3);
      });
    });

    context('use context', () => {
      let executor;

      beforeEach(() => {
        const context = {
          FOO_CONST: 1,
          barModel: {
            value: 2,
          },
        };

        executor = new UseCaseExecutor({
          updateDeps: (context) => {
            context.FOO_CONST = 10;
            context.barModel.value = 20;
          },
        }, context);
        _handleRejectedEventForDebugging(executor);
      });

      it('should pass shallow-copied context for each use-case logics', done => {
        executor.on('resolved', ({ context }) => {
          assert.strictEqual(context.FOO_CONST, 1);
          assert.strictEqual(context.barModel.value, 20);
          done();
        });
        executor.acceptExecutionQuery('updateDeps');
      });
    });

    context('with queuing', () => {
      let executor;

      beforeEach(() => {
        executor = new UseCaseExecutor({
          waitFor50: () => {
            return new Promise(resolve => setTimeout(() => {
              resolve(50);
            }, 50));
          },
          waitFor100: () => {
            return new Promise(resolve => setTimeout(() => {
              resolve(100);
            }, 100));
          },
          waitFor150: () => {
            return new Promise(resolve => setTimeout(() => {
              resolve(150);
            }, 150));
          },
        }, {});
        _handleRejectedEventForDebugging(executor);
      });

      it('should resolve parallel use-case execution queries in series', done => {
        const results = [];
        executor.on('resolved', ({ result }) => {
          results.push(result);
          if (results.length >= 3) {
            assert.deepStrictEqual(results, [150, 100, 50]);
            done();
          }
        });
        executor.acceptExecutionQuery('waitFor150');
        executor.acceptExecutionQuery('waitFor100');
        executor.acceptExecutionQuery('waitFor50');
      });
    });
  });

  describe('scenarios', () => {
    it('can accept an use-case execution query in another use-case logic', done => {
      const executor_ = new UseCaseExecutor({
        render: () => {
        },
        heavyWebApi: ({ executor }) => {
          return new Promise(resolve => {
            setTimeout(() => {
              executor.next('render');
              resolve();
            }, 100)
          });
        },
        fastProcess: () => {
        },
      }, {});

      _handleRejectedEventForDebugging(executor_);

      const history = [];
      executor_.on('resolved', ({ useCaseName }) => {
        history.push(useCaseName);
        if (history.length === 3) {
          assert.deepStrictEqual(history, ['heavyWebApi', 'fastProcess', 'render']);
          done();
        }
      });

      executor_.acceptExecutionQuery('heavyWebApi');
      executor_.acceptExecutionQuery('fastProcess');
    });
  });
});
