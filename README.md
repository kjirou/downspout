# downspout

[![CircleCI](https://circleci.com/gh/kjirou/downspout.svg?style=svg)](https://circleci.com/gh/kjirou/downspout)

Queue the emitting of disorderly events and write business logics routinely


## Purpose of this module
- Define business logic (such as ActionCreator) routinely.
  - This is solved by providing a format to describe to business logic like most of web frameworks.
- Therefore, it prevents simultaneous execution of multiple business logic.
  - It is very difficult to maintain consistency of data when multiple processes reference/update the same variable.
  - This is solved by queuing events.
