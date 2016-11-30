#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: (context, delta) => {
    counter += delta;
  },
};

const downspout = new Downspout(useCases);

downspout.on('execution:resolved', () => {
  process.stdout.write(`${ counter }\n`);
});

downspout.execute('increment', 2);  // -> "2"
downspout.execute('increment', 3);  // -> "5"
