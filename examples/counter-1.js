#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: () => {
    counter += 1;
  },
};

const downspout = new Downspout(useCases);

downspout.on('execution:resolved', () => {
  process.stdout.write(`${ counter }\n`);
});

downspout.execute('increment');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('increment');  // -> "3"
downspout.execute('increment');  // -> "4"
downspout.execute('increment');  // -> "5"
