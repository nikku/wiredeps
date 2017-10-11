#!/usr/bin/env node

var program = require('commander');

var pkg = require('../package'),
    wiredeps = require('../');

program
  .usage('[options] <file ...>')
  .description('generate snapshot aware shrinkwrap descriptor')
  .version(pkg.version)
  .option('-b, --branch [branch]', 'specify branch to resolve dependencies against', '')
  .option('-B --default-branch [defaultBranch]', 'Default branch if none specified', 'latest')
  .option('-t, --tag [tag]', 'specify tag to be built', '')
  .option('--force', 'force override of existing files')
  .option('--cwd [dir]', 'specify working directory', '')
  .option('-v, --verbose', 'print debug output')
  .parse(process.argv);


var deps = wiredeps({
  verbose: program.verbose,
  force: program.force,
  logger: console,
  cwd: program.cwd || process.cwd(),
  tag: program.tag,
  branch: program.branch,
  defaultBranch: program.defaultBranch
});

deps.wire(function(err) {
  process.exit(err ? 1 : 0);
});