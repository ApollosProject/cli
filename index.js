#!/usr/bin/env node

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import util from 'util';
import { exec as baseExec } from 'child_process';
import { execa } from 'execa';
import consola from 'consola';
import { program, Argument } from 'commander';

import version from './utils/get-version.cjs';
import makeMobileCommand from './commands/mobile/index.js';

const exec = util.promisify(baseExec);

// eslint-disable-next-line
const __dirname = dirname(fileURLToPath(import.meta.url));

program.name('apollos');
program.version(version);

// check version
(async () => {
  const { stdout: latest } = await execa(
    `${__dirname}/scripts/get-latest-version.sh`,
  );
  if (latest !== version) {
    consola.warn(
      `Apollos CLI current version: ${version}. Newer version is available: ${latest}`,
    );
  }
})();

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
