const assert = require('assert');


describe('index', () => {
  it('should be reference-copied from `lib/Downspout`', () => {
    const indexModule = require('../index');
    const DownspoutModule = require('../lib/Downspout');
    assert.strictEqual(indexModule, DownspoutModule);
  });
});
