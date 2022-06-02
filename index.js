#!/usr/bin/env node

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import util from 'util';
import { exec as baseExec } from 'child_process';
import { execa } from 'execa';
import { program, Argument } from 'commander';

import makeMobileCommand from './commands/mobile/index.js';

const exec = util.promisify(baseExec);

// eslint-disable-next-line
const __dirname = dirname(fileURLToPath(import.meta.url));

program.name('apollos');
program.version('0.0.2');

program.addCommand(makeMobileCommand());

const upgradeTag = new Argument('[tag]').default('latest');

program
  .command('upgrade')
  .description('Upgrades Apollos NPM packages')
  .addArgument(upgradeTag)
  .action((tag) => execa(`${__dirname}/scripts/upgrade.sh`, [tag]).stdout.pipe(process.stdout));

program
  .command('secrets')
  .description("Decrypt or encrypt your app's secrets")
  .argument('<password>')
  .option('-d', 'decrypt shared files')
  .option('-e', 'encrypt shared files')
  .action((password, options) => {
    if ((options.d && options.e) || (!options.d && !options.e)) console.error('Must use either -e or -d, not both');
    if (options.d) {
      exec(`${__dirname}/scripts/secrets.sh -d ${password}`).then(
        ({ stdout, stderr }) => {
          if (stdout) {
            console.log(stdout);
          }
          if (stderr) {
            console.log(stderr);
          }
        },
      );
    }
    if (options.e) {
      exec(`${__dirname}/scripts/secrets.sh -e ${password}`).then(
        ({ stdout, stderr }) => {
          if (stdout) {
            console.log(stdout);
          }
          if (stderr) {
            console.log(stderr);
          }
        },
      );
    }
  });

program.parse();
