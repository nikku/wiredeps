# wiredeps

Correctly build feature branches with snapshot dependencies across projects.


## How it works

[wiredeps](https://github.com/nikku/wiredeps) generates a [shrinkwrap configuration file](https://docs.npmjs.com/cli/shrinkwrap) based on an existing `.wiredeps` configuration.

See [this example project](https://github.com/nikku/wiredeps/blob/master/example/) to learn more.


## Integrate with Travis

On [travis-ci](https://travis-ci.org) for instance you would simply add the following to your `travis.yml`.

```
before_install:
  - npm install -g wiredeps
  - wiredeps --branch=$TRAVIS_BRANCH --tag=$TRAVIS_TAG
```


## License

MIT