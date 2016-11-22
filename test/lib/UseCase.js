const assert = require('assert');

const UseCase = require('../../lib/UseCase');


describe('lib/UseCase', () => {
  describe('_promisifyResult', () => {
    it('should return a resolved promise if undefined is passed', done => {
      UseCase._promisifyResult(undefined)
        .then(result => {
          assert.strictEqual(result, undefined);
          done();
        })
    });

    it('should return a rejected promise if a error is passed', done => {
      UseCase._promisifyResult(new Error('ERR!'))
        .catch(err => {
          assert.strictEqual(err.message, 'ERR!');
          done();
        })
      ;
    });

    it('should continue chaining promises if a resolved promise is passed', done => {
      UseCase._promisifyResult(Promise.resolve(123))
        .then(result => {
          assert.strictEqual(result, 123);
          done();
        })
    });

    it('should continue chaining promises if a rejected promise is passed', done => {
      UseCase._promisifyResult(Promise.reject(456))
        .catch(result => {
          assert.strictEqual(result, 456);
          done();
        })
    });
  });

  describe('execute', () => {
    it('should return a promise', done => {
      new UseCase({}, () => {})
        .execute()
        .then(() => done())
      ;
    });

    it('should return a rejected promise if the logic throws a error', done => {
      new UseCase({}, () => { throw new Error('NG'); })
        .execute()
        .catch(err => {
          assert.strictEqual(err.message, 'NG');
          done();
        })
      ;
    });

    it('should continue if the logic returns a promise', done => {
      new UseCase({}, () => Promise.resolve(123))
        .execute()
        .then(result => {
          assert.strictEqual(result, 123);
          done();
        })
      ;
    });

    it('can use the prepared context and passed arguments', done => {
      const context = {
        foo: { x: 1, y: 2 },
        bar: 3,
      };

      const logic = ({ foo, bar }, a, b) => {
        return foo.x + foo.y + bar + a + b;
      };

      new UseCase(context, logic)
        .execute(4, 5)
        .then(result => {
          assert.strictEqual(result, 15);
          done();
        })
      ;
    });
  });
});
