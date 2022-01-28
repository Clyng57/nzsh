#! /usr/bin/env node

const { program } = require('commander');
const build = require('./lib/build');
const run = require('./lib/run');

program
  .version('0.0.1')

program
  .command('build')
  .description('enter path, keyword, and search the directory')
  .action(build)

program
  .command('run')
  .argument('[file]', 'file to run')
  .description('view and run scripts')
  .action(file => {
    let runFile = file === undefined ? '' : file;
    run(runFile)
  })

program
  .parse(process.argv)