# example project

Execute `wiredeps` in this folder to generate a [shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) configuration file based on an existing `.wiredeps` configuration.

This allows you to correctly build feature branches across projects.

On [travis-ci](https://travis-ci.org) for instance you would simply do:

```
wiredeps --branch=$TRAVIS_BRANCH --tag=$TRAVIS_TAG
```