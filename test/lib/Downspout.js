const assert = require('assert');
const sinon = require('sinon');

const Downspout = require('../../lib/Downspout');


describe('lib/Downspout', () => {
  beforeEach(() => {
    sinon.stub(Downspout, '_getDefaultIsNoisy', () => true);
  });

  afterEach(() => {
    Downspout._getDefaultIsNoisy.restore();
  });

  describe('constructor', () => {
    it('should be created by only use-case logics', () => {
      const downspout = new Downspout({
        createFoo: () => {},
      });
      assert.strictEqual(downspout instanceof Downspout, true);
    });
  });

  describe('Emitting events by use-case executions', () => {
    it('should emit a "resolved" event after an use-case execution', done => {
      const downspout = new Downspout({
        createFoo: () => 'FOO',
      });
      downspout.on('execution:resolved', ({ result }) => {
        assert.strictEqual(result, 'FOO');
        done();
      });
      downspout.execute('createFoo');
    });

    it('should emit some "execution:resolved" events after some use-case executions', done => {
      let counter = 0;
      const downspout = new Downspout({
        count: () => counter += 1,
      });

      const results = [];
      downspout.on('execution:resolved', ({ result }) => {
        results.push(result);
        if (results.length === 3) {
          assert.deepStrictEqual([1, 2, 3], results);
          done();
        }
      });

      downspout.execute('count');
      downspout.execute('count');
      downspout.execute('count');
    });

    it('should emit a "rejected" event after an use-case execution failure', done => {
      const downspout = new Downspout({
        createFoo: () => { throw new Error('FOO?'); },
      }, { isNoisy: false });
      downspout.on('execution:rejected', ({ error }) => {
        assert.strictEqual(error.message, 'FOO?');
        done();
      });
      downspout.execute('createFoo');
    });

    it('should not execute use-cases after an use-case execution failure', done => {
      let results = [];
      const downspout = new Downspout({
        ng: () => { throw new Error('NG'); },
        ok: () => 'OK',
      }, { isNoisy: false });
      downspout.on('execution:rejected', ({ error }) => {
        results.push(error.message);
      });
      downspout.on('execution:resolved', ({ result }) => {
        results.push(result);
      });

      downspout.execute('ng');
      downspout.execute('ok');

      setTimeout(() => {
        assert.deepStrictEqual(results, ['NG']);
        done();
      }, 100);
    });
  });

  describe('Queuing of use-case executions', () => {
    it('should wait the previous use-case execution', done => {
      const downspout = new Downspout({
        first: () => new Promise(resolved => {
          setTimeout(resolved, 100);
        }),
        second: () => {},
        third: () => {},
      });

      const results = [];
      downspout.on('execution:resolved', ({ useCaseName }) => {
        results.push(useCaseName);
        if (results.length === 3) {
          assert.deepStrictEqual(results, ['first', 'second', 'third']);
          done();
        }
      });

      downspout.execute('first');
      downspout.execute('second');
      downspout.execute('third');
    });
  });

  describe('Use-case arguments', () => {
    it('can receive arguments in each use-cases', done => {
      const downspout = new Downspout({
        add: (context, a, b) => a + b
      });
      downspout.on('execution:resolved', ({ result }) => {
        assert.strictEqual(result, 3);
        done();
      });
      downspout.execute('add', 1, 2);
    });

    it('can emit another use-case by using the `utils.fork` method in the context', done => {
      const downspout = new Downspout({
        lockUIs: () => 'LOCKED',
        unlockUIs: () => 'UNLOCKED',
        addTodos: (context, todos) => todos,
        fetchTodos: ({ utils }) => {
          utils.fork('lockUIs');

          setTimeout(() => {
            utils.fork('addTodos', ['TODO1', 'TODO2']);
            utils.fork('unlockUIs');
          }, 100);

          return 'START_FETCHING';
        },
      });

      const results = [];
      downspout.on('execution:resolved', ({ result }) => {
        results.push(result);
        if (results.length === 4) {
          assert.deepStrictEqual(results, ['START_FETCHING', 'LOCKED', ['TODO1', 'TODO2'], 'UNLOCKED']);
          done();
        }
      });

      downspout.execute('fetchTodos');
    });
  });

  describe('Using the `routes` option', () => {
    it('can execute one use-case via plural routes', done => {
      const downspout = new Downspout({
        createTodo: (context, title) => title,
      }, {
        routes: {
          CLICK_TODO_REGISTRATION_BUTTON_1: 'createTodo',
          CLICK_TODO_REGISTRATION_BUTTON_2: 'createTodo',
        },
      });

      const results = [];
      downspout.on('execution:resolved', ({ result }) => {
        results.push(result);
        if (results.length === 2) {
          assert.deepStrictEqual(results, ['Yaruzo!', 'Ashita kara ganbaru..']);
          done();
        }
      });

      downspout.dispatch('CLICK_TODO_REGISTRATION_BUTTON_1', 'Yaruzo!');
      downspout.dispatch('CLICK_TODO_REGISTRATION_BUTTON_2', 'Ashita kara ganbaru..');
    });

    it('can set fixed arguments', done => {
      const downspout = new Downspout({
        changePage: (context, pageId) => pageId,
      }, {
        routes: {
          CLICK_HOME_BUTTON: ['changePage', 'HOME'],
          CLICK_TODOS_BUTTON: ['changePage', 'TODOS'],
        },
      });

      const results = [];
      downspout.on('execution:resolved', ({ result }) => {
        results.push(result);
        if (results.length === 3) {
          assert.deepStrictEqual(results, ['TOP', 'HOME', 'TODOS']);
          done();
        }
      });

      downspout.execute('changePage', 'TOP');
      downspout.dispatch('CLICK_HOME_BUTTON');
      downspout.dispatch('CLICK_TODOS_BUTTON');
    });
  });

  describe('Using the `context` option', () => {
    it('should share the passed object in use-cases', done => {
      const dependedSingletonInstances = {
        fooModel: { value: 0 },
      };

      const downspout = new Downspout({
        updateFoo: (context, value) => {
          context.fooModel.value = value;
        },
        doubleFoo: (context) => {
          context.fooModel.value *= 2;
        },
      }, {
        context: dependedSingletonInstances,
      });

      const results = [];
      downspout.on('execution:resolved', ({ context }) => {
        results.push(context.fooModel.value);
        if (results.length === 2) {
          assert.deepStrictEqual(results, [3, 6]);
          done();
        }
      });

      downspout.execute('updateFoo', 3);
      downspout.execute('doubleFoo');
    });
  });

  describe('EVENT_NAMES', () => {
    it('USE_CASE_EXECUTION_RESOLVED', done => {
      const downspout = new Downspout({
        foo: () => {},
      });
      downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, () => {
        done();
      });
      downspout.execute('foo');
    });

    it('USE_CASE_EXECUTION_REJECTED', done => {
      const downspout = new Downspout({
        foo: () => { throw new Error(''); },
      }, { isNoisy: false });
      downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_REJECTED, () => {
        done();
      });
      downspout.execute('foo');
    });
  });

  describe('generateExecutor', () => {
    it('can generate a bound function', done => {
      const downspout = new Downspout({
        foo: () => {},
      });
      downspout.on('execution:resolved', ({ useCaseName }) => {
        assert.strictEqual(useCaseName, 'foo');
        done();
      });

      const execute = downspout.generateExecutor();
      execute('foo');
    });
  });

  describe('generateDispatcher', () => {
    it('can generate a bound function', done => {
      const downspout = new Downspout({
        foo: () => {},
      }, {
        routes: {
          CLICK_FOO: 'foo',
        },
      });
      downspout.on('execution:resolved', ({ useCaseName }) => {
        assert.strictEqual(useCaseName, 'foo');
        done();
      });

      const dispatch = downspout.generateDispatcher();
      dispatch('CLICK_FOO');
    });
  });
});
