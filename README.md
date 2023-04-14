# robin-purple
Intro task for a job interview

# How to instal and run tests

Everything should be installed via
```
yarn install
```

## Running tests

`yarn cypress open` OR `yarn cypress run` for headless mode

# File organization

The intro task is divided into 3 files:
`/solution/1.txt` -> contains the task 1

`/solution/2.txt` -> contains the task 2

Task 3 is divided into multiple cypress files in the `/cypress` folder

There is a file `/solution/bugs.txt` that helds bugs found during the work in this task

# Known issues

3 out of 7 tests are failing, because of bugs in the code of the form. When the code will get repaired, these specs will not fail anymore :)

There is a `it.skip()` within a `spec.cy.js`. This is because this `it.skip()` serves as a proof of concept only, and shows how to improve this test suite, but because I don't have an access to the backoffice systems, it could not be implemented properly. 
