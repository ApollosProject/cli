#!/usr/bin/env node

import util from 'util';
import { exec as baseExec } from 'child_process';
import { execaSync } from 'execa';
import consola from 'consola';
import { program } from 'commander';

import version from './utils/get-version.cjs';
import scriptsDir from './utils/get-scripts-dir.cjs';
import makeMobileCommand from './commands/mobile/index.js';
import makeConfigCommand from './commands/config.js';

const exec = util.promisify(baseExec);

program.name('apollos');
program.version(version);

// check version
if (process.env.NODE_ENV !== 'test') {
  const { stdout: latest } = execaSync(`${scriptsDir}/get-latest-version.sh`);
  if (latest !== version) {
    consola.warn(
      `Apollos CLI current version: ${version}. Newer version is available: ${latest}`,
    );
  }
}

program.addCommand(makeMobileCommand());
program.addCommand(makeConfigCommand());

program
  .command('secrets')
  .description("Decrypt or encrypt your app's secrets")
  .argument('<password>')
  .option('-d', 'decrypt shared files')
  .option('-e', 'encrypt shared files')
  .action((password, options) => {
    if ((options.d && options.e) || (!options.d && !options.e)) console.error('Must use either -e or -d, not both');
    if (options.d) {
      exec(`${scriptsDir}/secrets.sh -d ${password}`).then(
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
      exec(`${scriptsDir}/secrets.sh -e ${password}`).then(
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
