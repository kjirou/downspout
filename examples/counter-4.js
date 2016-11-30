#!/usr/bin/env node

const Downspout = require('../index');

const useCases = {
  increment: (context, delta) => {
    context.counter += delta;
  },
};

const downspout = new Downspout(useCases, {
  context: {
    counter: 0,
  },
});

downspout.on('execution:resolved', ({ context }) => {
  process.stdout.write(`${ context.counter }\n`);
});

downspout.execute('increment', 2);  // -> "2"
downspout.execute('increment', 3);  // -> "5"
