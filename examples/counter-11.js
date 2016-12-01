#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: (context, delta) => {
    counter += delta;
  },
};

const routes = {
  CLICK_INCREMENT_BUTTON: 'increment',
};

const downspout = new Downspout(useCases, {
  routes,
});

downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, () => {
  process.stdout.write(`${ counter }\n`);
});

const execute = downspout.generateExecutor();
const dispatch = downspout.generateDispatcher();

execute('increment', 2);                // -> "2"
dispatch('CLICK_INCREMENT_BUTTON', 3);  // -> "5"
