# downspout

[![npm version](https://badge.fury.io/js/downspout.svg)](https://badge.fury.io/js/downspout)
[![CircleCI](https://circleci.com/gh/kjirou/downspout.svg?style=svg)](https://circleci.com/gh/kjirou/downspout)

README: ( [English](/README.md) | [日本語](/README.ja.md) )

A framework to serialize the execution of event handlers for disorderly event emitting


## Functions of this module
- Provide a framework for describing event handlers.
- Allow one event handler to execute as transaction processing.
- Queue the execution of event handlers.


## Installation
```bash
npm install --save downspout
```

Please use [browserify](https://github.com/substack/node-browserify)
  (or [webpack](https://github.com/webpack/webpack)) when using with browser.


## Usage
### Overview
![](/doc/overview.png)

```js
const Downspout = require('downspout');

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
```

### Basic usage by CLI counter samples
- [The simplest example](/examples/counter-1.js)
  - Keywords:
    - Use-cases
    - constructor
    - "execution:resolved" event
    - execute
- [Wait for completion of asynchronous processing](/examples/counter-2.js)
  - Keywords:
    - Promise
- [Pass arguments to use-cases](/examples/counter-3.js)
  - Keywords:
    - Use-case arguments
- [Specify the variables on which the use case depends](/examples/counter-4.js)
  - Keywords:
    - context
- [Implementation pattern like the Flux](/examples/counter-5.js)
  - Keywords:
    - result
- [Runtime error handling](/examples/counter-6.js)
  - Keywords:
    - "execution:rejected" event
    - error
- [Runtime error handling for development](/examples/counter-7.js)
  - Keywords:
    - isNoisy
- [Constants](/examples/counter-8.js)
  - Keywords:
    - EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED
    - EVENT_NAMES.USE_CASE_EXECUTION_REJECTED
- [Fork other use-cases](/examples/counter-9.js)
  - Keywords:
    - utils.fork
- [Separate layers of use cases and UI events](/examples/counter-10.js)
  - Keywords:
    - routes
    - dispatch
- [Generate bound event emitters to pass any view libraries](/examples/counter-11.js)
  - Keywords:
    - generateExecutor
    - generateDispatcher
- [Conclusion: Operable counter](/examples/counter-conclusion-1.js)
  - Example of the Flux (like) format
- [Conclusion: Fizz Buzz Game](/examples/counter-conclusion-2.js)
  - Example of the MVC format

### with the React
(Later)

### with the Redux
As far as using `bindActionCreators`, it was impossible.
