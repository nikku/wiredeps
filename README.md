# wiredeps

Wire the latest snapshot dependencies or feature branches during continuous integration builds.


## Configuration

Specify which dependencies to resolve in a `.wiredeps` configuration file that is located in a project root.

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

This sets up the project __and__ all nested dependencies to load the configured projects via the specified snapshot location.


## How it works

Wiredeps replaces `package.json` entries with their respective snapshot version.

It installs a hook to `node_modules/.hooks` to perform the same operation on nested dependencies, too.

```
├── node_modules
│   └── a
│       └── node_modules
│           └── b
└── .wiredeps
```


## License

MIT