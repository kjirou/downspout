#!/usr/bin/env node

const keypress = require('keypress');

const Downspout = require('../index');


keypress(process.stdin);
process.stdin.setRawMode(true);


//
// Implementation pattern of the Flux (like) format
//

const useCases = {
  increment: (context, delta) => {
    return {
      type: 'INCREMENT_COUNT',
      delta,
    };
  },
  incrementOneWithDelay: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          type: 'INCREMENT_COUNT',
          delta: 1,
        });
      }, 2000);
    });
  },
  doublingCount: () => {
    return {
      type: 'DOUBLING_COUNT',
    };
  },
};

const downspout = new Downspout(useCases, {
  context: {
    state: {
      counter: 0,
    },
  },
});

downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, ({ result: action, context: { state } }) => {
  switch (action.type) {
    case 'INCREMENT_COUNT':
      Object.assign(state, {
        counter: state.counter + action.delta,
      });
      break;
    case 'DOUBLING_COUNT':
      Object.assign(state, {
        counter: state.counter * 2,
      });
      break;
  }

  process.stdout.write(`${ state.counter }\n`);
});

process.stdin.on('keypress', (ch, key) => {
  if (key && key.ctrl && (key.name === 'c' || key.name === 'd')) {
    process.stdin.pause();
    process.exit();
  }

  if (/^\d$/.test(ch)) {
    downspout.execute('increment', Number(ch));
  } else if (ch === ' ') {
    downspout.execute('incrementOneWithDelay');
  } else if (ch === 'd') {
    downspout.execute('doublingCount');
  }
});


process.stdout.write(`====
(Ctrl|Cmd) & ("c"|"d") = Exit
             ("0"-"9") = Increment the inputted number
             " "       = Increment by 1 after 2 seconds
             "d"       = Doubling count
====\n`);

process.stdin.resume();
