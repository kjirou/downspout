#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        counter += 1;
        resolve();
      }, Math.random() * 2000);
    });
  },

  decrement: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        counter -= 1;
        resolve();
      }, Math.random() * 2000);
    });
  },
};

const downspout = new Downspout(useCases);

downspout.on('execution:resolved', () => {
  process.stdout.write(`${ counter }\n`);
});

downspout.execute('increment');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('decrement');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('increment');  // -> "3"
downspout.execute('decrement');  // -> "2"
downspout.execute('increment');  // -> "3"
downspout.execute('increment');  // -> "4"
downspout.execute('increment');  // -> "5"
