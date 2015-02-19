#!/usr/bin/env node

var program = require('commander');

var pkg = require('../package'),
    wiredeps = require('../');

program
  .usage('[options] <file ...>')
  .description('generate snapshot aware shrinkwrap descriptor')
  .version(pkg.version)
  .option('-b, --branch [branch]', 'Resolve dependencies against the specified branch', '')
  .option('-t, --tag [tag]', 'Specify this is a tagged release', '')
  .option('-v, --verbose', 'Print out loads of information')
  .option('--cwd [dir]', 'specify working directory', '')
  .parse(process.argv);


var deps = wiredeps({
  verbose: program.verbose,
  logger: console,
  cwd: program.cwd || process.cwd(),
  tag: program.tag,
  branch: program.branch
});

deps.wire(function(err) {
  process.exit(err ? 1 : 0);
});