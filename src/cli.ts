#!/usr/bin/env node

import { Command } from 'commander';
import { enableLogging } from './utils/logger';

import { buildProject } from './index';

const program = new Command();
program
  .command('build')
  .description('builds extensions')
  .option('-c, --config <config path>', 'specify the config file')
  .option('--debug', 'show debugging information')
  .action((cmd) => {
    if (cmd.debug) {
      enableLogging();
    }
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
