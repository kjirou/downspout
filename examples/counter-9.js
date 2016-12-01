#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: (context, delta) => {
    counter += delta;
  },
  doNotWaitAndIncrementLater: (context, delta) => {
    setTimeout(() => {
      // `fork` is an alias to `downspout.execute`
      context.utils.fork('increment', delta);
    }, 1000);
  },
};

const downspout = new Downspout(useCases);

downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, () => {
  process.stdout.write(`${ counter }\n`);
});

downspout.execute('increment', 1);                   // -> "1"
downspout.execute('doNotWaitAndIncrementLater', 2);  // -> "1"
downspout.execute('increment', 1);                   // -> "2"
downspout.execute('increment', 1);                   // -> "3"
                                                     // -> "5" (After 1000 ms
