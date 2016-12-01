#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: () => {
    counter += 1;
  },
  incrementButErrorOccurred: () => {
    throw new Error('Runtime error!');
  },
};

const downspout = new Downspout(useCases);

downspout.on('execution:resolved', () => {
  process.stdout.write(`${ counter }\n`);
});

downspout.on('execution:rejected', ({ error }) => {
  process.stdout.write(`${ error.message }\n`);
});

downspout.execute('increment');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('incrementButErrorOccurred');  // -> "Runtime error!"
downspout.execute('increment');  // -> No stdout (All use-cases will never execute again)
