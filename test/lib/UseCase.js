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
});
