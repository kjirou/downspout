const assert = require('assert');

const UseCaseExecutor = require('../../lib/UseCaseExecutor');


describe('lib/UseCaseExecutor', () => {
  const _handleRejectedEventForDebugging = (executor) => {
    executor.on('rejected', (result) => {
      console.error(result);
    });
  };

  describe('queryExecution', () => {
    let executor;

    context('simple cases (without args/without context/without queuing)', () => {
      beforeEach(() => {
        executor = new UseCaseExecutor({
          runResolvedLogic: () => {
            return 'RESOLVED';
          },
          runRejectedLogic: () => {
            throw new Error('REJECTED');
          },
        }, {});
      });

      it('can execute single resolved use-case logic', done => {
        _handleRejectedEventForDebugging(executor);

        executor.on('resolved', (result) => {
          assert.strictEqual(result, 'RESOLVED');
          done();
        });
        executor.queryExecution('runResolvedLogic');
      });

      it('can execute single rejected use-case logic', done => {
        executor.on('rejected', ({ error }) => {
          assert.strictEqual(error.message, 'REJECTED');
          done();
        });
        executor.queryExecution('runRejectedLogic');
      });
    });

    context('with args', () => {
      beforeEach(() => {
        executor = new UseCaseExecutor({
          sum: ({}, ...args) => {
            return args.reduce((m, v) => m + v, 0);
          },
        }, {});
        _handleRejectedEventForDebugging(executor);
      });

      it('can pass args to use-case logic', done => {
        executor.on('resolved', (result) => {
          assert.strictEqual(result, 6);
          done();
        });
        executor.queryExecution('sum', 1, 2, 3);
      });
    });

    context('with context', () => {
      let context;
      let executor;

      beforeEach(() => {
        context = {
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
        executor.on('resolved', () => {
          assert.strictEqual(context.FOO_CONST, 1);
          assert.strictEqual(context.barModel.value, 20);
          done();
        });
        executor.queryExecution('updateDeps');
      });
    });
  });

  // TODO:
  //describe('results');
  //describe('share context');
  //describe('queue executions');
  //describe('error handling');
});
