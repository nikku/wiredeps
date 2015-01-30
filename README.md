# wiredeps

Wire the latest snapshots of projects configured in a `.wiredeps` file to [GitHub](https://github.com) repositories during continuous integration builds.


## Configuration

Put a `.wiredeps` file into your project directory to specify which dependencies should be resolved via [GitHub](https://github.com).

```json
{
  "dependencies": {
    "a": "nikku/a",
    "b": "nikku/b"
  }
}
```


## Setup

Use the `wiredeps` command line to rewrite the `package.json` file to resolve the dependencies accordingly:

```
wiredeps
```

You may specify a feature branch, too:

```
wiredeps --branch=my-feature
```

This will attempt to resolve the dependencies from the given feature branch, too.

After executing `wiredeps` the `package.json` of the project __and__ dependencies will be resolved to load dependencies from [GitHub](https://github.com).


## How it works

Wiredeps replaces `package.json` entries with their respective snapshot version.

It installs a hook to `node_modules/.hooks` to perform the same operation on dependencies, too.

```
├── node_modules
│   └── a
│       └── node_modules
│           └── b
└── .wiredeps
```


## License

MIT