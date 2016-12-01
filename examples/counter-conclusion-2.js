#!/usr/bin/env node

const keypress = require('keypress');

const Downspout = require('../index');


keypress(process.stdin);
process.stdin.setRawMode(true);


//
// Implementation pattern of the MVC format
//

// Model
const context = {
  counter: 0,
  declarations: [],
  message: '',
};

// Controllers
const useCases = {
  tick: (context) => {
    const nextCounter = context.counter + 1;
    const isFizz = nextCounter % 3 === 0;
    const isBuzz = nextCounter % 5 === 0;
    const declarationsId = context.declarations.join(',');

    context.counter = nextCounter;
    context.declarations = [];

    if (
      isFizz && declarationsId !== 'fizz' ||
      isBuzz && declarationsId !== 'buzz' ||
      isFizz && isBuzz && declarationsId !== 'fizz,buzz'
    ) {
      context.message = 'You lose!';
      return;
    }

    setTimeout(() => {
      context.utils.fork('tick');
    }, 1000);
  },

  fizz: (context) => {
    context.declarations.push('fizz');
  },

  buzz: (context) => {
    context.declarations.push('buzz');
  },
};

const downspout = new Downspout(useCases, {
  context,
  isNoisy: true,
});

// View
const contextToView = (context) => {
  let output = `[${ context.counter }] `;
  output += context.declarations.map(v => v.toUpperCase() + '!').join(' ') + ' ';
  output += context.message;
  return output;
};

downspout.on(Downspout.EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED, ({ context }) => {
  process.stdout.write(contextToView(context) + '\n');
});

process.stdin.on('keypress', (ch, key) => {
  if (key && key.ctrl && (key.name === 'c' || key.name === 'd')) {
    process.stdin.pause();
    process.exit();
  }

  if (ch === 'f') {
    downspout.execute('fizz');
  } else if (ch === 'b') {
    downspout.execute('buzz');
  }
});


process.stdout.write(`====
(Ctrl|Cmd) & ("c"|"d") = Exit
             "f"       = Fizz
             "b"       = Buzz
====\n`);

downspout.execute('tick');

process.stdin.resume();
