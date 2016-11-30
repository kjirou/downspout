#!/usr/bin/env node

const Downspout = require('../index');

let counter = 0;

const useCases = {
  increment: () => {
    return Promise.reject(new Error('Runtime error!'));
  },
};

const downspout = new Downspout(useCases, {
  isNoisy: true,
});

downspout.execute('increment');  // -> "Error: Runtime error! ..." by console.error
