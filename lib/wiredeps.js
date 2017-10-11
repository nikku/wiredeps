var fs = require('fs'),
    path = require('path');

var asyncSeries = require('async').eachSeries,
    gitInfo = require('hosted-git-info'),
    request = require('request'),
    foreach = require('foreach');

var colors = require('colors/safe');

var wiredepsDescriptor = '.wiredeps',
    shrinkwrapDescriptor = 'npm-shrinkwrap.json';

function loadWiredepsConfig(dir) {

  var contents;

  try {
    contents = fs.readFileSync(path.join(dir, wiredepsDescriptor), 'utf8');
  } catch (e) {
    return null;
  }

  return JSON.parse(contents);
}

function hasShrinkwrapConfig(dir) {
  return fs.existsSync(path.join(dir, shrinkwrapDescriptor));
}

function writeShrinkwrapConfig(dir, config) {
  fs.writeFileSync(path.join(dir, shrinkwrapDescriptor), JSON.stringify(config, null, '  '), 'utf8');
}

function Wiredeps(options) {

  if (!(this instanceof Wiredeps)) {
    return new Wiredeps(options);
  }

  var logger = options.logger,
      branch = options.branch,
      defaultBranch = options.defaultBranch,
      tag = options.tag,
      verbose = options.verbose,
      force = options.force,
      cwd = options.cwd;

  function parseRepositoryInfo(url) {
    return gitInfo.fromUrl(url);
  }

  function log() {
    logger && logger.log.apply(logger, arguments);
  }

  function verboseLog() {
    verbose && log.apply(null, arguments);
  }

  function collectSnapshots(pkg, results) {
    if (parseRepositoryInfo(pkg.version)) {
      results.push(pkg);
    }

    foreach(pkg.dependencies || [], function(dep) {
      collectSnapshots(dep, results);
    });
  }

  function hasPackageDescriptor(info, cb) {

    var path = info.file('package.json');

    request.head(path, function (err, response, body) {
      if (!err && response.statusCode === 200) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    });
  }

  function resolveSnapshot(pkg, cb) {

    var version = pkg.version;

    var info = parseRepositoryInfo(version);

    if (info.comittish) {
      verboseLog('skipping ' + version + ', already specified');
      return cb(null, version, version);
    }

    info.comittish = branch || defaultBranch;

    hasPackageDescriptor(info, function(err, exists) {
      if (!exists) {
        info.comittish = defaultBranch;
      }

      pkg.version = info.path();
      verboseLog('resolving ' + version + ' via ' + colors.yellow('<' + pkg.version + '>'));

      cb(err, version, pkg.version);
    });
  }

  function generateShrinkwrap(descriptor) {
    log('writing shrinkwrap descriptor');
    writeShrinkwrapConfig(cwd, descriptor);
    log('done.');
  }

  this.wire = function(cb) {

    verboseLog('running in folder ' + cwd);

    if (tag) {
      log('tagged build, skipping');
      return cb();
    }

    verboseLog('loading descriptor from ' + cwd);

    var config = loadWiredepsConfig(cwd);

    if (!config) {
      log('no local ' + wiredepsDescriptor + ' found, skipping');
      return cb();
    }

    if (hasShrinkwrapConfig(cwd) && !force) {
      log('a local ' + shrinkwrapDescriptor + ' already exists, skipping');
      return cb();
    }

    if (branch || defaultBranch) {

      if (branch) {
        log('trying to resolve dependencies from branch ' + colors.yellow('<' + branch + '>'));
      }

      if (defaultBranch) {
        log(
          (branch ? 'falling back to' : 'resolving dependencies from') +
          ' default branch ' + colors.yellow('<' + defaultBranch + '>')
        );
      }

      var snapshots = [];

      collectSnapshots(config, snapshots);

      asyncSeries(snapshots, resolveSnapshot, function(err) {

        if (err) {
          return cb(err);
        }

        generateShrinkwrap(config);
        cb();
      });
    } else {

      generateShrinkwrap(config);
      cb();
    }
  };
}

module.exports = Wiredeps;