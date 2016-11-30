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

// == "execution:resolved"
downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, () => {
  process.stdout.write(`${ counter }\n`);
});

// == "execution:rejected"
downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_REJECTED, ({ error }) => {
  process.stdout.write(`${ error.message }\n`);
});

downspout.execute('increment');  // -> "1"
downspout.execute('incrementButErrorOccurred');  // -> "Runtime error!"
