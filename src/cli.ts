#!/usr/bin/env node

import { Command } from 'commander';

import { buildProject } from './commands/build';

const program = new Command();
program
  .command('build')
  .description('builds extensions')
  .option('-c, --config <config path>', 'specify the config file')
  .action((cmd) => {
    buildProject(cmd.config);
  });
program.parse(process.argv);

// TODO: scaffold project

// build project
// Compile assets:
/*
 out/
  chrome-extension/
    includes**
    manifest.json
  mozilla-extension/
    includes**
    manifest.json
*/
