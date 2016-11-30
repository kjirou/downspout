#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: (context, delta) => {
    counter += delta;
  },
};

// Aliases to use-cases
//   Separate the layers so that you do not have to think about the actual data when creating the view.
const routes = {
  CLICK_INCREMENT_BUTTON: 'increment',
  CLICK_INCREMENT_ONE_BUTTON: ['increment', 1],
  CLICK_INCREMENT_TWO_BUTTON: ['increment', 2],
};

const downspout = new Downspout(useCases, {
  routes,
});

downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, () => {
  process.stdout.write(`${ counter }\n`);
});

downspout.dispatch('CLICK_INCREMENT_BUTTON', 2);   // -> "2"
downspout.dispatch('CLICK_INCREMENT_ONE_BUTTON');  // -> "3"
downspout.dispatch('CLICK_INCREMENT_TWO_BUTTON');  // -> "5"
