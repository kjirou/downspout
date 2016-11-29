const assert = require('assert');

const EventRouter = require('../../lib/EventRouter');


describe('lib/EventRouter', () => {
  describe('_parseRouteData', () => {
    it('can parse an array', () => {
      assert.deepStrictEqual(EventRouter._parseRouteData(['createFoo', 1, 2]), {
        useCaseName: 'createFoo',
        fixedUseCaseArgs: [1, 2],
      });
    });

    it('can parse an array of only one element', () => {
      assert.deepStrictEqual(EventRouter._parseRouteData(['createFoo']), {
        useCaseName: 'createFoo',
        fixedUseCaseArgs: [],
      });
    });

    it('can not parse an empty array', () => {
      assert.deepStrictEqual(EventRouter._parseRouteData([]), {
        useCaseName: null,
        fixedUseCaseArgs: [],
      });
    });

    it('can parse a string', () => {
      assert.deepStrictEqual(EventRouter._parseRouteData('createFoo'), {
        useCaseName: 'createFoo',
        fixedUseCaseArgs: [],
      });
    });

    it('can not parse another types', () => {
      assert.deepStrictEqual(EventRouter._parseRouteData(123), {
        useCaseName: null,
        fixedUseCaseArgs: [],
      });
    });
  });

  describe('constructor', () => {
    it('should parse routes', () => {
      const router = new EventRouter({
        CLICK_BUTTON: ['createFoo', 1, 2],
        CLICK_LINK: ['createFoo'],
        SCROLL: ['changeFoos'],
      });
      assert.deepStrictEqual(router._parsedRoutes, {
        CLICK_BUTTON: { useCaseName: 'createFoo', fixedUseCaseArgs: [1, 2] },
        CLICK_LINK: { useCaseName: 'createFoo', fixedUseCaseArgs: [] },
        SCROLL: { useCaseName: 'changeFoos', fixedUseCaseArgs: [] },
      });
    });

    it('should throw an error if routes includes invalid data', () => {
      assert.throws(() => {
        new EventRouter({
          CLICK_BUTTON: ['createFoo', 1, 2],
          CLICK_LINK: [],
          SCROLL: ['changeFoos'],
        });
      }, /CLICK_LINK/);
    });
  });

  describe('eventDataToUseCaseExecutionQuery', () => {
    it('should convert to an use-case execution query', () => {
      const router = new EventRouter({ CLICK_BUTTON: ['createFoo', 1, 2] });
      assert.deepStrictEqual(router.eventDataToUseCaseExecutionQuery('CLICK_BUTTON', 3, 4), [
        'createFoo', 1, 2, 3, 4
      ]);
    });
  });
});
