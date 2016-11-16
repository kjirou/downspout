const assert = require('assert');

const UseCase = require('../../lib/UseCase');


describe('lib/UseCase', () => {
  describe('_promisifyResult', () => {
    it('should return a rejected promise if a error is passed', done => {
      UseCase._promisifyResult(new Error('ERR!'))
        .catch(err => {
          assert.strictEqual(err.message, 'ERR!');
          done();
        });
    });
  });
});
