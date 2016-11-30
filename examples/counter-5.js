#!/usr/bin/env node

const Downspout = require('../index');

const useCases = {
  increment: () => {
    const action = {
      type: 'INCREMENT',
      delta: 1,
    };
    return Promise.resolve(action);
  },
};

const downspout = new Downspout(useCases);

const state = {
  counter: 0,
};

downspout.on('execution:resolved', ({ result: action }) => {
  switch (action.type) {
    case 'INCREMENT':
      state.counter += action.delta;
      break;
  }

  process.stdout.write(`${ state.counter }\n`);
});

downspout.execute('increment');  // -> "1"
downspout.execute('increment');  // -> "2"
downspout.execute('increment');  // -> "3"
downspout.execute('increment');  // -> "4"
downspout.execute('increment');  // -> "5"
