#!/usr/bin/env node

const Downspout = require('../index');

const state = {
  counter: 0,
};

const useCases = {
  increment: () => {
    return Promise.resolve({
      type: 'INCREMENT',
    });
  },
  decrement: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          type: 'DECREMENT',
        });
      }, 1000);
    });
  },
};

const downspout = new Downspout(useCases);

downspout.on('execution:resolved', ({ result: action }) => {
  switch (action.type) {
    case 'INCREMENT':
      state.counter += 1;
      break;
    case 'DECREMENT':
      state.counter -= 1;
      break;
  }

  process.stdout.write(`${ state.counter }\n`);
});

downspout.execute('increment');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('decrement');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('decrement');  // -> "1"
